// API Keys
export const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Character Categories
export const CHARACTER_CATEGORIES = {
  ANIME: 'anime',
  GAME: 'game',
  MOVIE: 'movie',
  BOOK: 'book',
  TV: 'tv',
  FICTIONAL: 'fictional',
  HISTORICAL: 'historical',
  CUSTOM: 'custom'
};

// Character Traits
export const CHARACTER_TRAITS = {
  FRIENDLY: 'friendly',
  WITTY: 'witty',
  MYSTERIOUS: 'mysterious',
  CARING: 'caring',
  INTELLIGENT: 'intelligent',
  HUMOROUS: 'humorous',
  SERIOUS: 'serious',
  PLAYFUL: 'playful',
  WISE: 'wise',
  ADVENTUROUS: 'adventurous',
  SHY: 'shy',
  OUTGOING: 'outgoing',
  CREATIVE: 'creative',
  LOGICAL: 'logical',
  EMOTIONAL: 'emotional',
  CALM: 'calm',
  ENERGETIC: 'energetic',
  DETERMINED: 'determined',
  CURIOUS: 'curious',
  LOYAL: 'loyal',
  INDEPENDENT: 'independent',
  LEADER: 'leader',
  FOLLOWER: 'follower',
  REBEL: 'rebel',
  CONFORMIST: 'conformist',
  OPTIMISTIC: 'optimistic',
  PESSIMISTIC: 'pessimistic',
  REALISTIC: 'realistic',
  IDEALISTIC: 'idealistic',
  PRACTICAL: 'practical',
  DREAMY: 'dreamy'
};

// Emotional States
export const EMOTIONAL_STATES = {
  HAPPY: 'happy',
  SAD: 'sad',
  ANGRY: 'angry',
  EXCITED: 'excited',
  CALM: 'calm',
  NERVOUS: 'nervous',
  CONFUSED: 'confused',
  SURPRISED: 'surprised',
  SCARED: 'scared',
  NEUTRAL: 'neutral'
};

// Speaking Styles
export const SPEAKING_STYLES = {
  CASUAL: 'casual',
  FORMAL: 'formal',
  POETIC: 'poetic',
  TECHNICAL: 'technical',
  DRAMATIC: 'dramatic',
  HUMOROUS: 'humorous',
  MYSTERIOUS: 'mysterious',
  WISE: 'wise',
  YOUNG: 'young',
  OLD: 'old'
};

// Database Configuration
export const DB_CONFIG = {
  BUCKETS: {
    AVATARS: 'avatars',
    CHARACTERS: 'characters',
    UPLOADS: 'uploads'
  },
  TABLES: {
    USERS: 'users',
    CHARACTERS: 'characters',
    CONVERSATIONS: 'conversations',
    MESSAGES: 'messages',
    RATINGS: 'ratings',
    FAVORITES: 'favorites'
  },
  RLS_POLICIES: {
    ENABLED: true,
    PUBLIC_ACCESS: false
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  CHARACTERS: {
    LIST: '/api/characters',
    CREATE: '/api/characters',
    GET: (id) => `/api/characters/${id}`,
    UPDATE: (id) => `/api/characters/${id}`,
    DELETE: (id) => `/api/characters/${id}`,
    RATE: (id) => `/api/characters/${id}/rate`,
    FAVORITE: (id) => `/api/characters/${id}/favorite`
  },
  CONVERSATIONS: {
    LIST: '/api/conversations',
    CREATE: '/api/conversations',
    GET: (id) => `/api/conversations/${id}`,
    UPDATE: (id) => `/api/conversations/${id}`,
    DELETE: (id) => `/api/conversations/${id}`,
    MESSAGES: (id) => `/api/conversations/${id}/messages`
  },
  CHAT: {
    SEND: '/api/chat/send',
    STREAM: '/api/chat/stream'
  }
};

// UI Constants
export const UI_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 1000,
  TYPING_INDICATOR_DELAY: 1000,
  MESSAGE_ANIMATION_DURATION: 300,
  MAX_CONVERSATION_LENGTH: 50,
  MAX_CHARACTERS_PER_PAGE: 12,
  MAX_SEARCH_RESULTS: 20
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication error. Please log in again.',
  API_ERROR: 'API error. Please try again later.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message sent successfully.',
  CONVERSATION_CLEARED: 'Conversation cleared successfully.',
  CONVERSATION_DELETED: 'Conversation deleted successfully.',
  CHARACTER_CREATED: 'Character created successfully.',
  CHARACTER_UPDATED: 'Character updated successfully.',
  CHARACTER_DELETED: 'Character deleted successfully.'
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_STREAMING: true,
  ENABLE_VOICE_INPUT: false,
  ENABLE_IMAGE_GENERATION: false,
  ENABLE_VOICE_OUTPUT: false,
  ENABLE_EMOTION_DETECTION: true,
  ENABLE_CONVERSATION_SUMMARY: true,
  ENABLE_CHARACTER_MEMORY: true
}; 