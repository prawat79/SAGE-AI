import { supabase, TABLES, CHARACTER_CATEGORIES, CHARACTER_TRAITS } from '../lib/supabase';

class CharacterService {
  // Get all characters with pagination and filtering
  async getCharacters(filters = {}) {
    try {
      let query = supabase
        .from(TABLES.CHARACTERS)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters.traits && filters.traits.length > 0) {
        query = query.contains('traits', filters.traits);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching characters:', error);
      return this.getFallbackCharacters();
    }
  }

  // Get character by ID
  async getCharacterById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHARACTERS)
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching character:', error);
      return this.getFallbackCharacters().find(char => char.id === id);
    }
  }

  // Create new character with advanced features
  async createCharacter(characterData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHARACTERS)
        .insert([{
          ...characterData,
          created_at: new Date().toISOString(),
          is_active: true,
          chat_count: 0,
          rating: 0,
          memory: {
            conversations: [],
            preferences: {},
            knowledge: {}
          },
          personality: {
            traits: characterData.traits || [],
            background: characterData.background || '',
            speaking_style: characterData.speaking_style || 'casual',
            emotional_range: characterData.emotional_range || 'moderate'
          },
          capabilities: {
            can_remember: true,
            can_learn: true,
            can_express_emotions: true,
            can_use_memory: true
          }
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  }

  // Update character
  async updateCharacter(id, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHARACTERS)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  }

  // Increment chat count
  async incrementChatCount(characterId) {
    try {
      const { error } = await supabase
        .from(TABLES.CHARACTERS)
        .update({ 
          chat_count: supabase.raw('chat_count + 1')
        })
        .eq('id', characterId);

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing chat count:', error);
    }
  }

  // Get trending characters
  async getTrendingCharacters(limit = 10) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHARACTERS)
        .select('*')
        .eq('is_active', true)
        .order('chat_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trending characters:', error);
      return this.getFallbackCharacters().slice(0, limit);
    }
  }

  // Get featured characters
  async getFeaturedCharacters(limit = 6) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHARACTERS)
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured characters:', error);
      return this.getFallbackCharacters().slice(0, limit);
    }
  }

  // Fallback characters when database is unavailable
  getFallbackCharacters() {
    return [
      {
        id: '1',
        name: 'Sakura Haruno',
        description: 'A skilled medical ninja from the Hidden Leaf Village with pink hair and green eyes.',
        personality: 'Determined, caring, and strong-willed. She can be fierce in battle but gentle when healing.',
        background: 'A member of Team 7 alongside Naruto and Sasuke. She trained under Tsunade to become a powerful medical ninja.',
        category: CHARACTER_CATEGORIES.ANIME,
        traits: [CHARACTER_TRAITS.CARING, CHARACTER_TRAITS.ENERGETIC],
        avatar_url: '/images/characters/sakura.jpg',
        chat_count: 1250,
        rating: 4.8,
        is_featured: true,
        is_active: true,
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Asuka Langley',
        description: 'A fiery red-haired pilot of Evangelion Unit-02 with a complex personality.',
        personality: 'Confident, competitive, and prideful. She hides her vulnerabilities behind a strong exterior.',
        background: 'A skilled EVA pilot from Germany who joined NERV to fight Angels.',
        category: CHARACTER_CATEGORIES.ANIME,
        traits: [CHARACTER_TRAITS.DOMINANT, CHARACTER_TRAITS.TSUNDERE],
        avatar_url: '/images/characters/asuka.jpg',
        chat_count: 980,
        rating: 4.6,
        is_featured: true,
        is_active: true,
        created_at: '2024-01-10T14:30:00Z'
      },
      {
        id: '3',
        name: 'Zelda',
        description: 'The wise and courageous Princess of Hyrule with magical powers.',
        personality: 'Wise, brave, and compassionate. She carries the weight of her kingdom with grace.',
        background: 'The princess of Hyrule who possesses the Triforce of Wisdom and aids Link in his quests.',
        category: CHARACTER_CATEGORIES.GAME,
        traits: [CHARACTER_TRAITS.CARING, CHARACTER_TRAITS.MYSTERIOUS],
        avatar_url: '/images/characters/zelda.jpg',
        chat_count: 1500,
        rating: 4.9,
        is_featured: true,
        is_active: true,
        created_at: '2024-01-05T09:15:00Z'
      },
      {
        id: '4',
        name: 'Hermione Granger',
        description: 'A brilliant witch and loyal friend, known for her vast knowledge and quick thinking.',
        personality: 'Intelligent, logical, and fiercely loyal. She values knowledge and justice above all.',
        background: 'A Muggle-born witch who attended Hogwarts and was part of the golden trio.',
        category: CHARACTER_CATEGORIES.FICTIONAL,
        traits: [CHARACTER_TRAITS.CARING, CHARACTER_TRAITS.ENERGETIC],
        avatar_url: '/images/characters/hermione.jpg',
        chat_count: 2100,
        rating: 4.7,
        is_featured: false,
        is_active: true,
        created_at: '2024-01-01T16:20:00Z'
      },
      {
        id: '5',
        name: 'Yuki Nagato',
        description: 'A quiet and mysterious alien interface with incredible powers.',
        personality: 'Stoic, observant, and rarely shows emotion. She speaks in a monotone voice.',
        background: 'An alien created by the Data Overmind to observe Haruhi Suzumiya.',
        category: CHARACTER_CATEGORIES.ANIME,
        traits: [CHARACTER_TRAITS.COLD, CHARACTER_TRAITS.MYSTERIOUS],
        avatar_url: '/images/characters/yuki.jpg',
        chat_count: 750,
        rating: 4.5,
        is_featured: false,
        is_active: true,
        created_at: '2023-12-28T11:45:00Z'
      },
      {
        id: '6',
        name: 'Tifa Lockhart',
        description: 'A martial artist and bar owner with a kind heart and incredible strength.',
        personality: 'Caring, strong, and supportive. She is always there for her friends.',
        background: 'A member of AVALANCHE who fights against Shinra Corporation.',
        category: CHARACTER_CATEGORIES.GAME,
        traits: [CHARACTER_TRAITS.CARING, CHARACTER_TRAITS.FRIENDLY],
        avatar_url: '/images/characters/tifa.jpg',
        chat_count: 1800,
        rating: 4.8,
        is_featured: true,
        is_active: true,
        created_at: '2023-12-20T13:00:00Z'
      }
    ];
  }

  // Get available categories
  getCategories() {
    return Object.values(CHARACTER_CATEGORIES);
  }

  // Get available traits
  getTraits() {
    return Object.values(CHARACTER_TRAITS);
  }

  // Update character memory
  async updateCharacterMemory(characterId, memoryUpdate) {
    try {
      const { data: character } = await this.getCharacterById(characterId);
      if (!character) throw new Error('Character not found');

      const updatedMemory = {
        ...character.memory,
        ...memoryUpdate,
        last_updated: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(TABLES.CHARACTERS)
        .update({ memory: updatedMemory })
        .eq('id', characterId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating character memory:', error);
      throw error;
    }
  }

  // Add conversation to character memory
  async addConversationToMemory(characterId, conversation) {
    try {
      const { data: character } = await this.getCharacterById(characterId);
      if (!character) throw new Error('Character not found');

      const updatedMemory = {
        ...character.memory,
        conversations: [
          ...character.memory.conversations,
          {
            id: conversation.id,
            timestamp: new Date().toISOString(),
            summary: conversation.summary,
            key_points: conversation.key_points
          }
        ].slice(-50) // Keep last 50 conversations
      };

      const { data, error } = await supabase
        .from(TABLES.CHARACTERS)
        .update({ memory: updatedMemory })
        .eq('id', characterId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding conversation to memory:', error);
      throw error;
    }
  }

  // Update character personality
  async updateCharacterPersonality(characterId, personalityUpdate) {
    try {
      const { data: character } = await this.getCharacterById(characterId);
      if (!character) throw new Error('Character not found');

      const updatedPersonality = {
        ...character.personality,
        ...personalityUpdate,
        last_updated: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(TABLES.CHARACTERS)
        .update({ personality: updatedPersonality })
        .eq('id', characterId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating character personality:', error);
      throw error;
    }
  }

  // Get character's conversation history
  async getCharacterConversationHistory(characterId, limit = 10) {
    try {
      const { data: character } = await this.getCharacterById(characterId);
      if (!character) throw new Error('Character not found');

      return character.memory.conversations
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  // Get character's knowledge base
  async getCharacterKnowledge(characterId) {
    try {
      const { data: character } = await this.getCharacterById(characterId);
      if (!character) throw new Error('Character not found');

      return character.memory.knowledge;
    } catch (error) {
      console.error('Error getting character knowledge:', error);
      return {};
    }
  }

  // Update character's knowledge base
  async updateCharacterKnowledge(characterId, knowledgeUpdate) {
    try {
      const { data: character } = await this.getCharacterById(characterId);
      if (!character) throw new Error('Character not found');

      const updatedKnowledge = {
        ...character.memory.knowledge,
        ...knowledgeUpdate,
        last_updated: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(TABLES.CHARACTERS)
        .update({
          memory: {
            ...character.memory,
            knowledge: updatedKnowledge
          }
        })
        .eq('id', characterId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating character knowledge:', error);
      throw error;
    }
  }

  // Get character's emotional state
  async getCharacterEmotionalState(characterId) {
    try {
      const { data: character } = await this.getCharacterById(characterId);
      if (!character) throw new Error('Character not found');

      return {
        current_mood: character.personality.current_mood || 'neutral',
        emotional_intensity: character.personality.emotional_intensity || 0.5,
        last_updated: character.personality.last_updated
      };
    } catch (error) {
      console.error('Error getting character emotional state:', error);
      return {
        current_mood: 'neutral',
        emotional_intensity: 0.5,
        last_updated: new Date().toISOString()
      };
    }
  }

  // Update character's emotional state
  async updateCharacterEmotionalState(characterId, emotionalState) {
    try {
      const { data: character } = await this.getCharacterById(characterId);
      if (!character) throw new Error('Character not found');

      const updatedPersonality = {
        ...character.personality,
        current_mood: emotionalState.current_mood,
        emotional_intensity: emotionalState.emotional_intensity,
        last_updated: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(TABLES.CHARACTERS)
        .update({ personality: updatedPersonality })
        .eq('id', characterId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating character emotional state:', error);
      throw error;
    }
  }
}

export default new CharacterService();