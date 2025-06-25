export class AIService {
  static async generateResponse(messages, character, context = {}, apiKey) {
    try {
      if (!apiKey) {
        throw new Error('API key is required');
      }

      const systemPrompt = this.createSystemPrompt(character);
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.sender_type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: formattedMessages,
          max_tokens: 1000,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate response');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI Service error:', error);
      return this.getFallbackResponse(character);
    }
  }

  static createSystemPrompt(character) {
    return `You are ${character.name}. ${character.description}

Personality: ${character.personality}

Please respond in character, maintaining your personality and speaking style. Keep responses conversational and engaging, typically 1-3 sentences unless the user asks for something longer.`;
  }

  static getFallbackResponse(character) {
    const responses = [
      `Hello! I'm ${character.name}. How can I help you today?`,
      `Hi there! I'm excited to chat with you.`,
      `Greetings! What would you like to talk about?`,
      `Hey! I'm here and ready to have a great conversation.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export default AIService;