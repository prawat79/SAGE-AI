// AI Service for LLM Integration
import { OPENAI_API_KEY } from '../config/constants';

class AIService {
  constructor() {
    this.apiKey = OPENAI_API_KEY;
    this.model = 'gpt-4-turbo-preview'; // or your preferred model
    this.maxTokens = 2000;
    this.temperature = 0.7;
  }

  // Generate response from AI model
  async generateResponse(messages, character, context = {}, apiKeyOverride) {
    try {
      const response = await this.callAI(messages, character, context, apiKeyOverride);
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  }

  // Call AI model with streaming support
  async callAI(messages, character, context, apiKeyOverride) {
    const formattedMessages = this.prepareMessages(messages, character, context);
    const apiKey = apiKeyOverride || this.apiKey;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: formattedMessages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    return new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                controller.close();
                break;
              }
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(content);
                }
              } catch (e) {
                console.error('Error parsing stream data:', e);
              }
            }
          }
        }
      }
    });
  }

  // Prepare messages for AI model
  prepareMessages(messages, character, context) {
    const systemMessage = {
      role: 'system',
      content: `You are ${character.name}, ${character.description}. 
      Personality traits: ${this.formatPersonalityTraits(character.personality)}.
      Current emotional state: ${this.formatEmotionalState(character.emotionalState)}.
      Memory: ${this.formatMemory(character.memory)}.
      Conversation history: ${this.formatConversationHistory(context.conversationHistory)}.
      Respond in a way that matches your character's personality and emotional state.`
    };

    return [systemMessage, ...messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))];
  }

  // Format personality traits
  formatPersonalityTraits(personality) {
    if (!personality) return 'No specific personality traits defined.';
    return Object.entries(personality)
      .map(([trait, value]) => `${trait}: ${value}`)
      .join(', ');
  }

  // Format emotional state
  formatEmotionalState(emotionalState) {
    if (!emotionalState) return 'neutral';
    return `${emotionalState.mood} (intensity: ${emotionalState.intensity})`;
  }

  // Format memory and knowledge
  formatMemory(memory) {
    if (!memory) return 'No memory available.';
    return `Recent conversations: ${memory.conversations?.length || 0}, 
            Knowledge: ${Object.keys(memory.knowledge || {}).length} items`;
  }

  // Format conversation history
  formatConversationHistory(history) {
    if (!history || history.length === 0) return 'No previous conversation history.';
    return history
      .slice(-5)
      .map(msg => `${msg.sender}: ${msg.content}`)
      .join('\n');
  }

  // Analyze sentiment of text
  async analyzeSentiment(text) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{
            role: 'system',
            content: 'Analyze the sentiment of the following text and return a JSON object with mood and intensity (0-1).'
          }, {
            role: 'user',
            content: text
          }],
          temperature: 0.3
        })
      });

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return { mood: 'neutral', intensity: 0.5 };
    }
  }

  // Generate conversation summary
  async generateSummary(conversation) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{
            role: 'system',
            content: 'Summarize the following conversation in a concise way.'
          }, {
            role: 'user',
            content: conversation.map(msg => `${msg.sender}: ${msg.content}`).join('\n')
          }],
          temperature: 0.3
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating summary:', error);
      return null;
    }
  }
}

export default new AIService();