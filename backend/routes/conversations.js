const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { supabase, TABLES, handleSupabaseError, validateUserSession } = require('../config/supabase');
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

// Get user's conversations with pagination
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const user = await validateUserSession(req.headers.authorization);
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from(TABLES.CONVERSATIONS)
        .select(`
          *,
          characters(id, name, avatar_url),
          messages(id, content, created_at)
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        handleSupabaseError(error, 'fetch conversations');
      }
      
      // Get the latest message for each conversation
      const conversationsWithLatestMessage = data?.map(conv => {
        const latestMessage = conv.messages?.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )[0];
        
        return {
          ...conv,
          latest_message: latestMessage,
          messages: undefined // Remove messages array to avoid confusion
        };
      }) || [];
      
      res.json({
        conversations: conversationsWithLatestMessage,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        error: error.message || 'Failed to fetch conversations'
      });
    }
  }
);

// Get single conversation by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await validateUserSession(req.headers.authorization);
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from(TABLES.CONVERSATIONS)
      .select(`
        *,
        characters(*),
        messages(
          id,
          content,
          role,
          created_at,
          metadata
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Conversation not found'
        });
      }
      handleSupabaseError(error, 'fetch conversation');
    }
    
    // Sort messages by creation time
    if (data.messages) {
      data.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    
    res.json({
      conversation: data
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch conversation'
    });
  }
});

// Create new conversation
router.post('/',
  [
    body('character_id').isUUID(),
    body('title').optional().isLength({ min: 1, max: 200 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const user = await validateUserSession(req.headers.authorization);
      const { character_id, title } = req.body;
      
      // Verify character exists
      const { data: character, error: characterError } = await supabase
        .from(TABLES.CHARACTERS)
        .select('id, name')
        .eq('id', character_id)
        .single();
      
      if (characterError) {
        if (characterError.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Character not found'
          });
        }
        handleSupabaseError(characterError, 'verify character');
      }
      
      const conversationTitle = title || `Chat with ${character.name}`;
      
      const { data, error } = await supabase
        .from(TABLES.CONVERSATIONS)
        .insert({
          user_id: user.id,
          character_id,
          title: conversationTitle,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          characters(id, name, avatar_url)
        `)
        .single();
      
      if (error) {
        handleSupabaseError(error, 'create conversation');
      }
      
      // Update character chat count
      await supabase
        .from(TABLES.CHARACTERS)
        .update({ 
          chat_count: supabase.raw('chat_count + 1')
        })
        .eq('id', character_id);
      
      res.status(201).json({
        message: 'Conversation created successfully',
        conversation: data
      });
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({
        error: error.message || 'Failed to create conversation'
      });
    }
  }
);

// Update conversation (title, etc.)
router.put('/:id',
  [
    body('title').optional().isLength({ min: 1, max: 200 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const user = await validateUserSession(req.headers.authorization);
      const { id } = req.params;
      const { title } = req.body;
      
      // Verify user owns the conversation
      const { data: conversation, error: fetchError } = await supabase
        .from(TABLES.CONVERSATIONS)
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Conversation not found'
          });
        }
        handleSupabaseError(fetchError, 'fetch conversation for update');
      }
      
      if (conversation.user_id !== user.id) {
        return res.status(403).json({
          error: 'You can only update your own conversations'
        });
      }
      
      const { data, error } = await supabase
        .from(TABLES.CONVERSATIONS)
        .update({
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        handleSupabaseError(error, 'update conversation');
      }
      
      res.json({
        message: 'Conversation updated successfully',
        conversation: data
      });
    } catch (error) {
      console.error('Update conversation error:', error);
      res.status(500).json({
        error: error.message || 'Failed to update conversation'
      });
    }
  }
);

// Delete conversation
router.delete('/:id', async (req, res) => {
  try {
    const user = await validateUserSession(req.headers.authorization);
    const { id } = req.params;
    
    // Verify user owns the conversation
    const { data: conversation, error: fetchError } = await supabase
      .from(TABLES.CONVERSATIONS)
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Conversation not found'
        });
      }
      handleSupabaseError(fetchError, 'fetch conversation for deletion');
    }
    
    if (conversation.user_id !== user.id) {
      return res.status(403).json({
        error: 'You can only delete your own conversations'
      });
    }
    
    // Delete all messages in the conversation first
    await supabase
      .from(TABLES.MESSAGES)
      .delete()
      .eq('conversation_id', id);
    
    // Delete the conversation
    const { error } = await supabase
      .from(TABLES.CONVERSATIONS)
      .delete()
      .eq('id', id);
    
    if (error) {
      handleSupabaseError(error, 'delete conversation');
    }
    
    res.json({
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to delete conversation'
    });
  }
});

// Clear conversation messages
router.delete('/:id/messages', async (req, res) => {
  try {
    const user = await validateUserSession(req.headers.authorization);
    const { id } = req.params;
    
    // Verify user owns the conversation
    const { data: conversation, error: fetchError } = await supabase
      .from(TABLES.CONVERSATIONS)
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Conversation not found'
        });
      }
      handleSupabaseError(fetchError, 'fetch conversation for clearing');
    }
    
    if (conversation.user_id !== user.id) {
      return res.status(403).json({
        error: 'You can only clear your own conversations'
      });
    }
    
    // Delete all messages in the conversation
    const { error } = await supabase
      .from(TABLES.MESSAGES)
      .delete()
      .eq('conversation_id', id);
    
    if (error) {
      handleSupabaseError(error, 'clear conversation messages');
    }
    
    // Update conversation timestamp
    await supabase
      .from(TABLES.CONVERSATIONS)
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);
    
    res.json({
      message: 'Conversation messages cleared successfully'
    });
  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to clear conversation'
    });
  }
});

// Get conversation statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const user = await validateUserSession(req.headers.authorization);
    const { id } = req.params;
    
    // Verify user owns the conversation
    const { data: conversation, error: fetchError } = await supabase
      .from(TABLES.CONVERSATIONS)
      .select('user_id, created_at')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Conversation not found'
        });
      }
      handleSupabaseError(fetchError, 'fetch conversation for stats');
    }
    
    if (conversation.user_id !== user.id) {
      return res.status(403).json({
        error: 'You can only view stats for your own conversations'
      });
    }
    
    // Get message statistics
    const { data: messageStats, error: statsError } = await supabase
      .from(TABLES.MESSAGES)
      .select('role, content')
      .eq('conversation_id', id);
    
    if (statsError) {
      handleSupabaseError(statsError, 'fetch message stats');
    }
    
    const userMessages = messageStats?.filter(m => m.role === 'user') || [];
    const assistantMessages = messageStats?.filter(m => m.role === 'assistant') || [];
    
    const totalWords = messageStats?.reduce((total, msg) => {
      return total + (msg.content?.split(' ').length || 0);
    }, 0) || 0;
    
    res.json({
      stats: {
        total_messages: messageStats?.length || 0,
        user_messages: userMessages.length,
        assistant_messages: assistantMessages.length,
        total_words: totalWords,
        created_at: conversation.created_at,
        duration_days: Math.ceil(
          (new Date() - new Date(conversation.created_at)) / (1000 * 60 * 60 * 24)
        )
      }
    });
  } catch (error) {
    console.error('Get conversation stats error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch conversation stats'
    });
  }
});

module.exports = router;