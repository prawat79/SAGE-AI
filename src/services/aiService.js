export class AIService {
  static async generateResponse(messages, character, context = {}, apiKey) {
    try {
      // Use provided API key or fallback to environment variable
      const geminiApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!geminiApiKey) {
        throw new Error('Gemini API key is required');
      }

      const systemPrompt = this.createSystemPrompt(character);
      
      // Format messages for Gemini API
      const formattedMessages = this.formatMessagesForGemini(messages, systemPrompt);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: formattedMessages,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate response');
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated');
      }

      const candidate = data.candidates[0];
      
      if (candidate.finishReason === 'SAFETY') {
        return "I apologize, but I can't respond to that request due to safety guidelines. Let's talk about something else!";
      }

      return candidate.content?.parts?.[0]?.text || this.getFallbackResponse(character);
    } catch (error) {
      console.error('AI Service error:', error);
      return this.getFallbackResponse(character);
    }
  }

  static formatMessagesForGemini(messages, systemPrompt) {
    const contents = [];
    
    // Add system prompt as the first user message
    contents.push({
      role: 'user',
      parts: [{ text: systemPrompt }]
    });
    
    // Add a model response acknowledging the system prompt
    contents.push({
      role: 'model',
      parts: [{ text: 'I understand. I will roleplay as this character and respond accordingly.' }]
    });

    // Add conversation messages
    messages.forEach(msg => {
      const role = msg.sender_type === 'user' ? 'user' : 'model';
      contents.push({
        role: role,
        parts: [{ text: msg.content }]
      });
    });

    return contents;
  }

  static createSystemPrompt(character) {
    return `You are ${character.name}. ${character.description}

Personality: ${character.personality}

Important instructions:
- Stay in character as ${character.name} at all times
- Respond naturally and conversationally
- Keep responses engaging but not too long (1-3 sentences unless asked for more)
- Show your personality through your words and tone
- Be helpful and respectful while maintaining your character
- If asked about topics outside your character knowledge, respond as your character would

Please respond in character to the following conversation.`;
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