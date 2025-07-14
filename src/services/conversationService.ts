const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ConversationService {
  static async createConversation(userId, characterId, title = null, accessToken) {
    try {
      const conversationData = {
        character_id: characterId,
        title: title || `Chat with Character`
      };

      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(conversationData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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

  static async getConversation(id, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  static async getUserConversations(userId, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  static async getMessages(conversationId, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  static async saveMessage(conversationId, content, senderType, accessToken) {
    try {
      const messageData = {
        content,
        sender_type: senderType
      };

      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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

  static async clearConversation(conversationId, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error clearing conversation:', error);
      throw error;
    }
  }

  static async deleteConversation(conversationId, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
}

export default ConversationService;