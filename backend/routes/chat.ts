const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase, TABLES, handleSupabaseError, validateUserSession } = require('../config/supabase');
const { generateAIResponse } = require('../config/ai');
const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Send message in a conversation
router.post('/send',
  [
    body('conversation_id').isUUID(),
    body('message').isLength({ min: 1, max: 4000 }).trim(),
    body('ai_provider').optional().isIn(['openai', 'anthropic'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const user = await validateUserSession(req.headers.authorization);
      const { conversation_id, message, ai_provider = 'openai' } = req.body;
      
      // Verify user owns the conversation and get character info
      const { data: conversation, error: convError } = await supabase
        .from(TABLES.CONVERSATIONS)
        .select(`
          *,
          characters(
            id,
            name,
            description,
            personality,
            scenario,
            greeting_message,
            ai_model,
            ai_provider
          )
        `)
        .eq('id', conversation_id)
        .eq('user_id', user.id)
        .single();
      
      if (convError) {
        if (convError.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Conversation not found or access denied'
          });
        }
        handleSupabaseError(convError, 'fetch conversation');
      }
      
      const character = conversation.characters;
      
      // Get recent conversation history for context
      const { data: recentMessages, error: msgError } = await supabase
        .from(TABLES.MESSAGES)
        .select('role, content, created_at')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: false })
        .limit(20); // Last 20 messages for context
      
      if (msgError) {
        handleSupabaseError(msgError, 'fetch recent messages');
      }
      
      // Reverse to get chronological order
      const messageHistory = recentMessages?.reverse() || [];
      
      // Save user message
      const { data: userMessage, error: userMsgError } = await supabase
        .from(TABLES.MESSAGES)
        .insert({
          conversation_id,
          role: 'user',
          content: message,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (userMsgError) {
        handleSupabaseError(userMsgError, 'save user message');
      }
      
      // Generate AI response
      let aiResponse;
      try {
        const provider = character.ai_provider || ai_provider;
        const model = character.ai_model || (provider === 'anthropic' ? 'claude-3-sonnet-20240229' : 'gpt-3.5-turbo');
        
        aiResponse = await generateAIResponse(
          message,
          character,
          messageHistory,
          provider,
          model
        );
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        aiResponse = "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
      }
      
      // Save AI response
      const { data: assistantMessage, error: aiMsgError } = await supabase
        .from(TABLES.MESSAGES)
        .insert({
          conversation_id,
          role: 'assistant',
          content: aiResponse,
          created_at: new Date().toISOString(),
          metadata: {
            ai_provider: character.ai_provider || ai_provider,
            ai_model: character.ai_model || model,
            character_id: character.id
          }
        })
        .select()
        .single();
      
      if (aiMsgError) {
        handleSupabaseError(aiMsgError, 'save AI message');
      }
      
      // Update conversation timestamp
      await supabase
        .from(TABLES.CONVERSATIONS)
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation_id);
      
      res.json({
        success: true,
        user_message: userMessage,
        assistant_message: assistantMessage,
        character: {
          id: character.id,
          name: character.name
        }
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        error: error.message || 'Failed to send message'
      });
    }
  }
);

// Get messages for a conversation with pagination
router.get('/:conversation_id/messages',
  async (req, res) => {
    try {
      const user = await validateUserSession(req.headers.authorization);
      const { conversation_id } = req.params;
      const { page = 1, limit = 50, before } = req.query;
      
      // Verify user owns the conversation
      const { data: conversation, error: convError } = await supabase
        .from(TABLES.CONVERSATIONS)
        .select('user_id')
        .eq('id', conversation_id)
        .eq('user_id', user.id)
        .single();
      
      if (convError) {
        if (convError.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Conversation not found or access denied'
          });
        }
        handleSupabaseError(convError, 'verify conversation access');
      }
      
      let query = supabase
        .from(TABLES.MESSAGES)
        .select('*')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));
      
      // If 'before' timestamp is provided, get messages before that time
      if (before) {
        query = query.lt('created_at', before);
      }
      
      const { data: messages, error: msgError } = await query;
      
      if (msgError) {
        handleSupabaseError(msgError, 'fetch messages');
      }
      
      // Reverse to get chronological order (oldest first)
      const orderedMessages = messages?.reverse() || [];
      
      res.json({
        messages: orderedMessages,
        has_more: messages?.length === parseInt(limit),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        error: error.message || 'Failed to fetch messages'
      });
    }
  }
);

// Delete a specific message
router.delete('/messages/:message_id', async (req, res) => {
  try {
    const user = await validateUserSession(req.headers.authorization);
    const { message_id } = req.params;
    
    // Get message and verify ownership through conversation
    const { data: message, error: msgError } = await supabase
      .from(TABLES.MESSAGES)
      .select(`
        *,
        conversations!inner(
          user_id
        )
      `)
      .eq('id', message_id)
      .single();
    
    if (msgError) {
      if (msgError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Message not found'
        });
      }
      handleSupabaseError(msgError, 'fetch message for deletion');
    }
    
    if (message.conversations.user_id !== user.id) {
      return res.status(403).json({
        error: 'You can only delete messages from your own conversations'
      });
    }
    
    // Delete the message
    const { error: deleteError } = await supabase
      .from(TABLES.MESSAGES)
      .delete()
      .eq('id', message_id);
    
    if (deleteError) {
      handleSupabaseError(deleteError, 'delete message');
    }
    
    res.json({
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      error: error.message || 'Failed to delete message'
    });
  }
});

// Regenerate AI response for the last message
router.post('/regenerate',
  [
    body('conversation_id').isUUID(),
    body('ai_provider').optional().isIn(['openai', 'anthropic'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const user = await validateUserSession(req.headers.authorization);
      const { conversation_id, ai_provider = 'openai' } = req.body;
      
      // Verify user owns the conversation and get character info
      const { data: conversation, error: convError } = await supabase
        .from(TABLES.CONVERSATIONS)
        .select(`
          *,
          characters(
            id,
            name,
            description,
            personality,
            scenario,
            greeting_message,
            ai_model,
            ai_provider
          )
        `)
        .eq('id', conversation_id)
        .eq('user_id', user.id)
        .single();
      
      if (convError) {
        if (convError.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Conversation not found or access denied'
          });
        }
        handleSupabaseError(convError, 'fetch conversation');
      }
      
      const character = conversation.characters;
      
      // Get the last two messages (user message and AI response)
      const { data: lastMessages, error: msgError } = await supabase
        .from(TABLES.MESSAGES)
        .select('*')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (msgError) {
        handleSupabaseError(msgError, 'fetch last messages');
      }
      
      if (!lastMessages || lastMessages.length < 2) {
        return res.status(400).json({
          error: 'Not enough messages to regenerate response'
        });
      }
      
      const [lastAiMessage, lastUserMessage] = lastMessages;
      
      if (lastAiMessage.role !== 'assistant' || lastUserMessage.role !== 'user') {
        return res.status(400).json({
          error: 'Cannot regenerate: last message is not from assistant'
        });
      }
      
      // Get conversation history (excluding the last AI message)
      const { data: messageHistory, error: historyError } = await supabase
        .from(TABLES.MESSAGES)
        .select('role, content, created_at')
        .eq('conversation_id', conversation_id)
        .neq('id', lastAiMessage.id)
        .order('created_at', { ascending: true })
        .limit(20);
      
      if (historyError) {
        handleSupabaseError(historyError, 'fetch message history');
      }
      
      // Generate new AI response
      let aiResponse;
      try {
        const provider = character.ai_provider || ai_provider;
        const model = character.ai_model || (provider === 'anthropic' ? 'claude-3-sonnet-20240229' : 'gpt-3.5-turbo');
        
        aiResponse = await generateAIResponse(
          lastUserMessage.content,
          character,
          messageHistory || [],
          provider,
          model
        );
      } catch (aiError) {
        console.error('AI regeneration error:', aiError);
        aiResponse = "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
      }
      
      // Update the existing AI message
      const { data: updatedMessage, error: updateError } = await supabase
        .from(TABLES.MESSAGES)
        .update({
          content: aiResponse,
          created_at: new Date().toISOString(),
          metadata: {
            ai_provider: character.ai_provider || ai_provider,
            ai_model: character.ai_model || model,
            character_id: character.id,
            regenerated: true
          }
        })
        .eq('id', lastAiMessage.id)
        .select()
        .single();
      
      if (updateError) {
        handleSupabaseError(updateError, 'update AI message');
      }
      
      // Update conversation timestamp
      await supabase
        .from(TABLES.CONVERSATIONS)
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation_id);
      
      res.json({
        success: true,
        message: 'Response regenerated successfully',
        assistant_message: updatedMessage,
        character: {
          id: character.id,
          name: character.name
        }
      });
    } catch (error) {
      console.error('Regenerate response error:', error);
      res.status(500).json({
        error: error.message || 'Failed to regenerate response'
      });
    }
  }
);

// Get typing indicator status (for future real-time features)
router.get('/:conversation_id/typing', async (req, res) => {
  try {
    const user = await validateUserSession(req.headers.authorization);
    const { conversation_id } = req.params;
    
    // Verify user owns the conversation
    const { data: conversation, error: convError } = await supabase
      .from(TABLES.CONVERSATIONS)
      .select('user_id')
      .eq('id', conversation_id)
      .eq('user_id', user.id)
      .single();
    
    if (convError) {
      if (convError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Conversation not found or access denied'
        });
      }
      handleSupabaseError(convError, 'verify conversation access');
    }
    
    // For now, just return false. In a real implementation,
    // this would check if the AI is currently generating a response
    res.json({
      is_typing: false,
      conversation_id
    });
  } catch (error) {
    console.error('Get typing status error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get typing status'
    });
  }
});

module.exports = router;