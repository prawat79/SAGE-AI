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

// Get all characters with filtering and pagination
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('category').optional().isString(),
    query('search').optional().isString(),
    query('sort').optional().isIn(['popular', 'newest', 'rating', 'name'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        search,
        sort = 'popular'
      } = req.query;
      
      const offset = (page - 1) * limit;
      
      let query = supabase
        .from(TABLES.CHARACTERS)
        .select(`
          *,
          character_categories(name),
          conversations(count)
        `, { count: 'exact' });
      
      // Apply filters
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{"${search}"}`);
      }
      
      // Apply sorting
      switch (sort) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'popular':
        default:
          query = query.order('chat_count', { ascending: false });
          break;
      }
      
      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      
      const { data, error, count } = await query;
      
      if (error) {
        handleSupabaseError(error, 'fetch characters');
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
      console.error('Get characters error:', error);
      res.status(500).json({
        error: error.message || 'Failed to fetch characters'
      });
    }
  }
);

// Get featured characters
router.get('/featured', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.CHARACTERS)
      .select('*')
      .eq('is_featured', true)
      .order('rating', { ascending: false })
      .limit(8);
    
    if (error) {
      handleSupabaseError(error, 'fetch featured characters');
    }
    
    res.json({
      characters: data || []
    });
  } catch (error) {
    console.error('Get featured characters error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch featured characters'
    });
  }
});

// Get character categories
router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.CHARACTER_CATEGORIES)
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      handleSupabaseError(error, 'fetch categories');
    }
    
    res.json({
      categories: data || []
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch categories'
    });
  }
});

// Get single character by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from(TABLES.CHARACTERS)
      .select(`
        *,
        character_categories(name),
        users(username, avatar_url)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Character not found'
        });
      }
      handleSupabaseError(error, 'fetch character');
    }
    
    // Increment view count
    await supabase
      .from(TABLES.CHARACTERS)
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id);
    
    res.json({
      character: data
    });
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch character'
    });
  }
});

// Create new character (authenticated)
router.post('/',
  [
    body('name').isLength({ min: 1, max: 100 }),
    body('description').isLength({ min: 10, max: 1000 }),
    body('category').isString(),
    body('personality').isIn(['friendly', 'mysterious', 'playful', 'wise', 'romantic', 'adventurous', 'scholarly', 'rebellious']),
    body('avatar_url').optional().isURL(),
    body('background').optional().isLength({ max: 2000 }),
    body('speaking_style').optional().isLength({ max: 500 }),
    body('traits').optional().isArray(),
    body('tags').optional().isArray(),
    body('is_public').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const user = await validateUserSession(req.headers.authorization);
      
      const {
        name,
        description,
        category,
        personality,
        avatar_url,
        background,
        speaking_style,
        traits,
        tags,
        is_public = true
      } = req.body;
      
      const { data, error } = await supabase
        .from(TABLES.CHARACTERS)
        .insert({
          name,
          description,
          category,
          personality,
          avatar_url,
          background,
          speaking_style,
          traits: traits || [],
          tags: tags || [],
          is_public,
          creator_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        handleSupabaseError(error, 'create character');
      }
      
      res.status(201).json({
        message: 'Character created successfully',
        character: data
      });
    } catch (error) {
      console.error('Create character error:', error);
      res.status(500).json({
        error: error.message || 'Failed to create character'
      });
    }
  }
);

// Update character (authenticated, owner only)
router.put('/:id',
  [
    body('name').optional().isLength({ min: 1, max: 100 }),
    body('description').optional().isLength({ min: 10, max: 1000 }),
    body('category').optional().isString(),
    body('personality').optional().isIn(['friendly', 'mysterious', 'playful', 'wise', 'romantic', 'adventurous', 'scholarly', 'rebellious']),
    body('avatar_url').optional().isURL(),
    body('background').optional().isLength({ max: 2000 }),
    body('speaking_style').optional().isLength({ max: 500 }),
    body('traits').optional().isArray(),
    body('tags').optional().isArray(),
    body('is_public').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const user = await validateUserSession(req.headers.authorization);
      const { id } = req.params;
      
      // Check if user owns the character
      const { data: character, error: fetchError } = await supabase
        .from(TABLES.CHARACTERS)
        .select('creator_id')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Character not found'
          });
        }
        handleSupabaseError(fetchError, 'fetch character for update');
      }
      
      if (character.creator_id !== user.id) {
        return res.status(403).json({
          error: 'You can only update your own characters'
        });
      }
      
      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from(TABLES.CHARACTERS)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        handleSupabaseError(error, 'update character');
      }
      
      res.json({
        message: 'Character updated successfully',
        character: data
      });
    } catch (error) {
      console.error('Update character error:', error);
      res.status(500).json({
        error: error.message || 'Failed to update character'
      });
    }
  }
);

// Delete character (authenticated, owner only)
router.delete('/:id', async (req, res) => {
  try {
    const user = await validateUserSession(req.headers.authorization);
    const { id } = req.params;
    
    // Check if user owns the character
    const { data: character, error: fetchError } = await supabase
      .from(TABLES.CHARACTERS)
      .select('creator_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Character not found'
        });
      }
      handleSupabaseError(fetchError, 'fetch character for deletion');
    }
    
    if (character.creator_id !== user.id) {
      return res.status(403).json({
        error: 'You can only delete your own characters'
      });
    }
    
    const { error } = await supabase
      .from(TABLES.CHARACTERS)
      .delete()
      .eq('id', id);
    
    if (error) {
      handleSupabaseError(error, 'delete character');
    }
    
    res.json({
      message: 'Character deleted successfully'
    });
  } catch (error) {
    console.error('Delete character error:', error);
    res.status(500).json({
      error: error.message || 'Failed to delete character'
    });
  }
});

// Like/unlike character (authenticated)
router.post('/:id/like', async (req, res) => {
  try {
    const user = await validateUserSession(req.headers.authorization);
    const { id } = req.params;
    
    // Check if character exists
    const { data: character, error: fetchError } = await supabase
      .from(TABLES.CHARACTERS)
      .select('id, like_count')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Character not found'
        });
      }
      handleSupabaseError(fetchError, 'fetch character for like');
    }
    
    // Check if user already liked this character
    const { data: existingLike } = await supabase
      .from('character_likes')
      .select('id')
      .eq('character_id', id)
      .eq('user_id', user.id)
      .single();
    
    if (existingLike) {
      // Unlike
      await supabase
        .from('character_likes')
        .delete()
        .eq('character_id', id)
        .eq('user_id', user.id);
      
      await supabase
        .from(TABLES.CHARACTERS)
        .update({ like_count: Math.max(0, (character.like_count || 0) - 1) })
        .eq('id', id);
      
      res.json({
        message: 'Character unliked',
        liked: false
      });
    } else {
      // Like
      await supabase
        .from('character_likes')
        .insert({
          character_id: id,
          user_id: user.id,
          created_at: new Date().toISOString()
        });
      
      await supabase
        .from(TABLES.CHARACTERS)
        .update({ like_count: (character.like_count || 0) + 1 })
        .eq('id', id);
      
      res.json({
        message: 'Character liked',
        liked: true
      });
    }
  } catch (error) {
    console.error('Like character error:', error);
    res.status(500).json({
      error: error.message || 'Failed to like character'
    });
  }
});

module.exports = router;