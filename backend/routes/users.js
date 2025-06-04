const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { supabase, TABLES, handleSupabaseError, validateUserSession, getUserProfile, updateUserProfile } = require('../config/supabase');
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

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await validateUserSession(req.headers.authorization);
    const profile = await getUserProfile(user.id);
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        ...profile
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch user profile'
    });
  }
});

// Update user profile
router.put('/profile',
  [
    body('username').optional().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('full_name').optional().isLength({ min: 1, max: 100 }),
    body('bio').optional().isLength({ max: 500 }),
    body('avatar_url').optional().isURL(),
    body('website').optional().isURL(),
    body('location').optional().isLength({ max: 100 }),
    body('preferences').optional().isObject()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const user = await validateUserSession(req.headers.authorization);
      const { username, full_name, bio, avatar_url, website, location, preferences } = req.body;
      
      // Check if username is already taken (if provided)
      if (username) {
        const { data: existingUser, error: checkError } = await supabase
          .from(TABLES.USER_PROFILES)
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          handleSupabaseError(checkError, 'check username availability');
        }
        
        if (existingUser) {
          return res.status(400).json({
            error: 'Username is already taken'
          });
        }
      }
      
      const updatedProfile = await updateUserProfile(user.id, {
        username,
        full_name,
        bio,
        avatar_url,
        website,
        location,
        preferences
      });
      
      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          ...updatedProfile
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: error.message || 'Failed to update profile'
      });
    }
  }
);

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const user = await validateUserSession(req.headers.authorization);
    
    // Get conversation count
    const { count: conversationCount, error: convError } = await supabase
      .from(TABLES.CONVERSATIONS)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    if (convError) {
      handleSupabaseError(convError, 'count conversations');
    }
    
    // Get message count
    const { count: messageCount, error: msgError } = await supabase
      .from(TABLES.MESSAGES)
      .select('conversations!inner(user_id)', { count: 'exact', head: true })
      .eq('conversations.user_id', user.id)
      .eq('role', 'user');
    
    if (msgError) {
      handleSupabaseError(msgError, 'count messages');
    }
    
    // Get created characters count
    const { count: charactersCount, error: charError } = await supabase
      .from(TABLES.CHARACTERS)
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.id);
    
    if (charError) {
      handleSupabaseError(charError, 'count characters');
    }
    
    // Get liked characters count
    const { count: likedCount, error: likedError } = await supabase
      .from(TABLES.CHARACTER_LIKES)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    if (likedError) {
      handleSupabaseError(likedError, 'count liked characters');
    }
    
    // Get account creation date
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user.id);
    
    if (userError) {
      console.error('Get user data error:', userError);
    }
    
    res.json({
      stats: {
        conversations: conversationCount || 0,
        messages_sent: messageCount || 0,
        characters_created: charactersCount || 0,
        characters_liked: likedCount || 0,
        member_since: userData?.user?.created_at || null,
        days_active: userData?.user?.created_at ? 
          Math.ceil((new Date() - new Date(userData.user.created_at)) / (1000 * 60 * 60 * 24)) : 0
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch user statistics'
    });
  }
});

// Get user's created characters
router.get('/characters',
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
        .from(TABLES.CHARACTERS)
        .select('*', { count: 'exact' })
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        handleSupabaseError(error, 'fetch user characters');
      }
      
      res.json({
        characters: data || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      });
    } catch (error) {
      console.error('Get user characters error:', error);
      res.status(500).json({
        error: error.message || 'Failed to fetch user characters'
      });
    }
  }
);

// Get user's liked characters
router.get('/liked-characters',
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
        .from(TABLES.CHARACTER_LIKES)
        .select(`
          created_at,
          characters(*)
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        handleSupabaseError(error, 'fetch liked characters');
      }
      
      const likedCharacters = data?.map(item => ({
        ...item.characters,
        liked_at: item.created_at
      })) || [];
      
      res.json({
        characters: likedCharacters,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      });
    } catch (error) {
      console.error('Get liked characters error:', error);
      res.status(500).json({
        error: error.message || 'Failed to fetch liked characters'
      });
    }
  }
);

// Get user's recent activity
router.get('/activity',
  [
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const user = await validateUserSession(req.headers.authorization);
      const { limit = 20 } = req.query;
      
      // Get recent conversations
      const { data: recentConversations, error: convError } = await supabase
        .from(TABLES.CONVERSATIONS)
        .select(`
          id,
          title,
          updated_at,
          characters(id, name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(parseInt(limit));
      
      if (convError) {
        handleSupabaseError(convError, 'fetch recent conversations');
      }
      
      // Get recent character creations
      const { data: recentCharacters, error: charError } = await supabase
        .from(TABLES.CHARACTERS)
        .select('id, name, avatar_url, created_at')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (charError) {
        handleSupabaseError(charError, 'fetch recent characters');
      }
      
      // Get recent likes
      const { data: recentLikes, error: likesError } = await supabase
        .from(TABLES.CHARACTER_LIKES)
        .select(`
          created_at,
          characters(id, name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (likesError) {
        handleSupabaseError(likesError, 'fetch recent likes');
      }
      
      // Combine and sort all activities
      const activities = [];
      
      recentConversations?.forEach(conv => {
        activities.push({
          type: 'conversation',
          action: 'updated',
          timestamp: conv.updated_at,
          data: conv
        });
      });
      
      recentCharacters?.forEach(char => {
        activities.push({
          type: 'character',
          action: 'created',
          timestamp: char.created_at,
          data: char
        });
      });
      
      recentLikes?.forEach(like => {
        activities.push({
          type: 'character',
          action: 'liked',
          timestamp: like.created_at,
          data: like.characters
        });
      });
      
      // Sort by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      res.json({
        activities: activities.slice(0, parseInt(limit))
      });
    } catch (error) {
      console.error('Get user activity error:', error);
      res.status(500).json({
        error: error.message || 'Failed to fetch user activity'
      });
    }
  }
);

// Search users (public profiles only)
router.get('/search',
  [
    query('q').isLength({ min: 1, max: 100 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from(TABLES.USER_PROFILES)
        .select(`
          id,
          username,
          full_name,
          bio,
          avatar_url,
          created_at
        `, { count: 'exact' })
        .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        handleSupabaseError(error, 'search users');
      }
      
      res.json({
        users: data || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        error: error.message || 'Failed to search users'
      });
    }
  }
);

// Get public user profile by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const { data: profile, error: profileError } = await supabase
      .from(TABLES.USER_PROFILES)
      .select(`
        id,
        username,
        full_name,
        bio,
        avatar_url,
        website,
        location,
        created_at
      `)
      .eq('username', username)
      .eq('is_public', true)
      .single();
    
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'User not found or profile is private'
        });
      }
      handleSupabaseError(profileError, 'fetch public profile');
    }
    
    // Get public statistics
    const { count: charactersCount } = await supabase
      .from(TABLES.CHARACTERS)
      .select('*', { count: 'exact', head: true })
      .eq('created_by', profile.id)
      .eq('is_public', true);
    
    res.json({
      user: {
        ...profile,
        stats: {
          characters_created: charactersCount || 0
        }
      }
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch user profile'
    });
  }
});

// Get public characters by username
router.get('/:username/characters',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { username } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
      // Get user ID from username
      const { data: profile, error: profileError } = await supabase
        .from(TABLES.USER_PROFILES)
        .select('id')
        .eq('username', username)
        .eq('is_public', true)
        .single();
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          return res.status(404).json({
            error: 'User not found or profile is private'
          });
        }
        handleSupabaseError(profileError, 'fetch user for characters');
      }
      
      const { data, error, count } = await supabase
        .from(TABLES.CHARACTERS)
        .select('*', { count: 'exact' })
        .eq('created_by', profile.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        handleSupabaseError(error, 'fetch public characters');
      }
      
      res.json({
        characters: data || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      });
    } catch (error) {
      console.error('Get user public characters error:', error);
      res.status(500).json({
        error: error.message || 'Failed to fetch user characters'
      });
    }
  }
);

module.exports = router;