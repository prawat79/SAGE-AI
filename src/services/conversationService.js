import { supabase, TABLES } from '../lib/supabase';
import aiService from './aiService';
import characterService from './characterService';

class ConversationService {
  // Create new conversation
  async createConversation(userId, characterId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CONVERSATIONS)
        .insert([{
          user_id: userId,
          character_id: characterId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Return fallback conversation ID
      return {
        id: `temp_${Date.now()}`,
        user_id: userId,
        character_id: characterId,
        created_at: new Date().toISOString(),
        is_active: true
      };
    }
  }

  // Get conversation by ID
  async getConversation(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CONVERSATIONS)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  // Get user's conversations
  async getUserConversations(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CONVERSATIONS)
        .select(`
          *,
          character:characters(id, name, avatar_url),
          messages(content, created_at)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      return [];
    }
  }

  // Get messages for a conversation
  async getMessages(conversationId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  // Send message with streaming support
  async sendMessage(conversationId, content, sender, character) {
    try {
      // Create user message
      const userMessage = {
        conversation_id: conversationId,
        content,
        sender: 'user',
        created_at: new Date().toISOString()
      };

      const { data: savedUserMessage, error: userError } = await supabase
        .from(TABLES.MESSAGES)
        .insert(userMessage)
        .select()
        .single();

      if (userError) throw userError;

      // Get conversation context
      const context = await this.getConversationContext(conversationId, character);

      // Generate AI response with streaming
      const aiResponse = await aiService.generateResponse(
        [savedUserMessage],
        character,
        context
      );

      // Create AI message
      const aiMessage = {
        conversation_id: conversationId,
        content: '',
        sender: 'character',
        created_at: new Date().toISOString()
      };

      const { data: savedAiMessage, error: aiError } = await supabase
        .from(TABLES.MESSAGES)
        .insert(aiMessage)
        .select()
        .single();

      if (aiError) throw aiError;

      // Update character memory and emotional state
      await characterService.addConversationToMemory(character.id, {
        user: content,
        character: aiResponse
      });

      const sentiment = await aiService.analyzeSentiment(aiResponse);
      await characterService.updateCharacterEmotionalState(character.id, sentiment);

      return {
        userMessage: savedUserMessage,
        aiMessage: savedAiMessage,
        stream: aiResponse
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get conversation context
  async getConversationContext(conversationId, character) {
    try {
      // Get recent messages
      const messages = await this.getMessages(conversationId);
      const recentMessages = messages.slice(-10);

      // Get character memory and emotional state
      const characterMemory = await characterService.getCharacterMemory(character.id);
      const emotionalState = await characterService.getCharacterEmotionalState(character.id);

      return {
        conversationHistory: recentMessages,
        characterMemory,
        emotionalState
      };
    } catch (error) {
      console.error('Error getting conversation context:', error);
      throw error;
    }
  }

  // Save individual message
  async saveMessage(conversationId, content, sender) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .insert([{
          conversation_id: conversationId,
          content,
          sender,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      // Return fallback message
      return {
        id: `temp_${Date.now()}`,
        conversation_id: conversationId,
        content,
        sender,
        created_at: new Date().toISOString()
      };
    }
  }

  // Update conversation timestamp
  async updateConversationTimestamp(conversationId) {
    try {
      const { error } = await supabase
        .from(TABLES.CONVERSATIONS)
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating conversation timestamp:', error);
    }
  }

  // Delete conversation
  async deleteConversation(conversationId) {
    try {
      const { error } = await supabase
        .from(TABLES.CONVERSATIONS)
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // Clear conversation
  async clearConversation(conversationId) {
    try {
      const { error } = await supabase
        .from(TABLES.MESSAGES)
        .delete()
        .eq('conversation_id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing conversation:', error);
      throw error;
    }
  }

  // Get conversation statistics
  async getConversationStats(conversationId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .select('id, sender')
        .eq('conversation_id', conversationId);

      if (error) throw error;
      
      const stats = {
        total: data.length,
        user: data.filter(m => m.sender === 'user').length,
        character: data.filter(m => m.sender === 'character').length
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching conversation stats:', error);
      return { total: 0, user: 0, character: 0 };
    }
  }

  // Search messages in conversation
  async searchMessages(conversationId, query) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .select('*')
        .eq('conversation_id', conversationId)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  async summarizeConversation(conversationId) {
    try {
      const messages = await this.getMessages(conversationId);
      const summary = await aiService.generateSummary(messages);
      
      const { error } = await supabase
        .from(TABLES.CONVERSATIONS)
        .update({ summary })
        .eq('id', conversationId);

      if (error) throw error;
      return summary;
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      throw error;
    }
  }
}

export default new ConversationService();