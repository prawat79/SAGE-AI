import { supabase } from '../lib/supabase';

export class ConversationService {
  static async createConversation(userId, characterId, title = null) {
    try {
      const conversationData = {
        user_id: userId,
        character_id: characterId,
        title: title || `Chat with Character`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('conversations')
        .insert([conversationData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        // Return a temporary conversation for demo purposes
        return {
          id: `temp_${Date.now()}`,
          ...conversationData
        };
      }

      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Return a temporary conversation for demo purposes
      return {
        id: `temp_${Date.now()}`,
        user_id: userId,
        character_id: characterId,
        title: title || `Chat with Character`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  static async getConversation(id) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  static async getUserConversations(userId) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          characters(id, name, avatar_url)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  static async getMessages(conversationId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  static async saveMessage(conversationId, content, senderType) {
    try {
      const messageData = {
        conversation_id: conversationId,
        content,
        sender_type: senderType,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        // Return a temporary message for demo purposes
        return {
          id: `temp_${Date.now()}`,
          ...messageData
        };
      }

      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      // Return a temporary message for demo purposes
      return {
        id: `temp_${Date.now()}`,
        conversation_id: conversationId,
        content,
        sender_type: senderType,
        created_at: new Date().toISOString()
      };
    }
  }

  static async updateConversationTimestamp(conversationId) {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (error) {
        console.error('Supabase error:', error);
      }
    } catch (error) {
      console.error('Error updating conversation timestamp:', error);
    }
  }

  static async deleteConversation(conversationId) {
    try {
      // First delete all messages
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      // Then delete the conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
}

export default ConversationService;