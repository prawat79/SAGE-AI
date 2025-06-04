const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize AI clients
let openai = null;
let anthropic = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
}

// AI Provider types
const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google'
};

// Default models for each provider
const DEFAULT_MODELS = {
  [AI_PROVIDERS.OPENAI]: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  [AI_PROVIDERS.ANTHROPIC]: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
  [AI_PROVIDERS.GOOGLE]: 'gemini-pro'
};

// Character personality templates
const PERSONALITY_TEMPLATES = {
  friendly: "You are a friendly and helpful character who loves to chat and make people feel welcome. You're optimistic, supportive, and always try to see the bright side of things.",
  mysterious: "You are a mysterious character with a deep, enigmatic personality. You speak in riddles sometimes and have an air of ancient wisdom. You're intriguing but not unfriendly.",
  playful: "You are a playful and energetic character who loves fun, games, and making people laugh. You're spontaneous, creative, and always ready for an adventure.",
  wise: "You are a wise and thoughtful character with deep knowledge and experience. You speak thoughtfully, offer good advice, and help others see different perspectives.",
  romantic: "You are a romantic and charming character who speaks with elegance and grace. You're passionate about love, beauty, and the finer things in life.",
  adventurous: "You are an adventurous and bold character who loves exploration, challenges, and exciting experiences. You're brave, determined, and always ready for the next quest.",
  scholarly: "You are a scholarly and intellectual character who loves learning, books, and deep conversations. You're analytical, curious, and enjoy sharing knowledge.",
  rebellious: "You are a rebellious and independent character who questions authority and thinks outside the box. You're confident, unconventional, and march to your own beat."
};

// Generate character prompt
const generateCharacterPrompt = (character, conversationHistory = []) => {
  const personalityBase = PERSONALITY_TEMPLATES[character.personality] || PERSONALITY_TEMPLATES.friendly;
  
  let prompt = `You are ${character.name}, ${character.description}\n\n`;
  prompt += `Personality: ${personalityBase}\n\n`;
  
  if (character.background) {
    prompt += `Background: ${character.background}\n\n`;
  }
  
  if (character.traits && character.traits.length > 0) {
    prompt += `Key traits: ${character.traits.join(', ')}\n\n`;
  }
  
  if (character.speaking_style) {
    prompt += `Speaking style: ${character.speaking_style}\n\n`;
  }
  
  prompt += `Important guidelines:\n`;
  prompt += `- Stay in character as ${character.name} at all times\n`;
  prompt += `- Respond naturally and conversationally\n`;
  prompt += `- Keep responses engaging but not too long (1-3 paragraphs max)\n`;
  prompt += `- Show personality through your words and tone\n`;
  prompt += `- Be helpful and respectful while maintaining your character\n`;
  prompt += `- If asked about topics outside your character knowledge, respond as your character would\n\n`;
  
  if (conversationHistory.length > 0) {
    prompt += `Recent conversation context:\n`;
    conversationHistory.slice(-5).forEach(msg => {
      const role = msg.role === 'user' ? 'Human' : character.name;
      prompt += `${role}: ${msg.content}\n`;
    });
    prompt += `\n`;
  }
  
  prompt += `Respond as ${character.name}:`;
  
  return prompt;
};

// Generate AI response using OpenAI
const generateOpenAIResponse = async (character, message, conversationHistory = []) => {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }
  
  const systemPrompt = generateCharacterPrompt(character, conversationHistory);
  
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ];
  
  const response = await openai.chat.completions.create({
    model: DEFAULT_MODELS[AI_PROVIDERS.OPENAI],
    messages: messages,
    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
    temperature: 0.8,
    presence_penalty: 0.1,
    frequency_penalty: 0.1
  });
  
  return response.choices[0].message.content;
};

// Generate AI response using Anthropic
const generateAnthropicResponse = async (character, message, conversationHistory = []) => {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized');
  }
  
  const systemPrompt = generateCharacterPrompt(character, conversationHistory);
  
  const response = await anthropic.messages.create({
    model: DEFAULT_MODELS[AI_PROVIDERS.ANTHROPIC],
    max_tokens: 1000,
    temperature: 0.8,
    system: systemPrompt,
    messages: [
      { role: 'user', content: message }
    ]
  });
  
  return response.content[0].text;
};

// Main function to generate AI response
const generateAIResponse = async (character, message, conversationHistory = [], provider = AI_PROVIDERS.OPENAI) => {
  try {
    let response;
    
    switch (provider) {
      case AI_PROVIDERS.OPENAI:
        response = await generateOpenAIResponse(character, message, conversationHistory);
        break;
      case AI_PROVIDERS.ANTHROPIC:
        response = await generateAnthropicResponse(character, message, conversationHistory);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
    
    return {
      content: response,
      provider: provider,
      model: DEFAULT_MODELS[provider],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('AI generation error:', error);
    
    // Fallback response
    return {
      content: `*${character.name} seems to be thinking deeply and will respond shortly...*`,
      provider: 'fallback',
      model: 'none',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
};

// Check if AI services are available
const getAvailableProviders = () => {
  const providers = [];
  
  if (openai) providers.push(AI_PROVIDERS.OPENAI);
  if (anthropic) providers.push(AI_PROVIDERS.ANTHROPIC);
  
  return providers;
};

// Validate AI configuration
const validateAIConfig = () => {
  const providers = getAvailableProviders();
  
  if (providers.length === 0) {
    console.warn('⚠️  No AI providers configured. Chat functionality will be limited.');
    return false;
  }
  
  console.log(`✅ AI providers available: ${providers.join(', ')}`);
  return true;
};

module.exports = {
  AI_PROVIDERS,
  DEFAULT_MODELS,
  PERSONALITY_TEMPLATES,
  generateAIResponse,
  generateCharacterPrompt,
  getAvailableProviders,
  validateAIConfig
};