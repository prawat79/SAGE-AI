const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase, validateUserSession, upsertUserProfile } = require('../config/supabase');
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

// Sign up with email and password
router.post('/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('fullName').optional().isLength({ max: 100 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { email, password, username, fullName } = req.body;
      
      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();
      
      if (existingUser) {
        return res.status(400).json({
          error: 'Username already taken'
        });
      }
      
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName || ''
          }
        }
      });
      
      if (authError) {
        return res.status(400).json({
          error: authError.message
        });
      }
      
      // Create user profile
      if (authData.user) {
        await upsertUserProfile(authData.user.id, {
          username,
          full_name: fullName || '',
          email,
          avatar_url: null,
          bio: '',
          created_at: new Date().toISOString()
        });
      }
      
      res.status(201).json({
        message: 'User created successfully',
        user: authData.user,
        session: authData.session
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        error: 'Failed to create user'
      });
    }
  }
);

// Sign in with email and password
router.post('/signin',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return res.status(401).json({
          error: error.message
        });
      }
      
      res.json({
        message: 'Signed in successfully',
        user: data.user,
        session: data.session
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({
        error: 'Failed to sign in'
      });
    }
  }
);

// Sign out
router.post('/signout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await supabase.auth.admin.signOut(token);
    }
    
    res.json({
      message: 'Signed out successfully'
    });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({
      error: 'Failed to sign out'
    });
  }
});

// Get current user
router.get('/user', async (req, res) => {
  try {
    const user = await validateUserSession(req.headers.authorization);
    
    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    res.json({
      user: {
        ...user,
        profile
      }
    });
  } catch (error) {
    res.status(401).json({
      error: error.message
    });
  }
});

// Refresh session
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({
        error: 'Refresh token required'
      });
    }
    
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });
    
    if (error) {
      return res.status(401).json({
        error: error.message
      });
    }
    
    res.json({
      message: 'Session refreshed successfully',
      session: data.session
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({
      error: 'Failed to refresh session'
    });
  }
});

// Reset password
router.post('/reset-password',
  [
    body('email').isEmail().normalizeEmail()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { email } = req.body;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      });
      
      if (error) {
        return res.status(400).json({
          error: error.message
        });
      }
      
      res.json({
        message: 'Password reset email sent'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        error: 'Failed to send reset email'
      });
    }
  }
);

// Update password
router.post('/update-password',
  [
    body('password').isLength({ min: 6 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const user = await validateUserSession(req.headers.authorization);
      const { password } = req.body;
      
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        return res.status(400).json({
          error: error.message
        });
      }
      
      res.json({
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({
        error: 'Failed to update password'
      });
    }
  }
);

// OAuth sign in (Google, GitHub, etc.)
router.post('/oauth/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { token } = req.body;
    
    if (!['google', 'github'].includes(provider)) {
      return res.status(400).json({
        error: 'Unsupported OAuth provider'
      });
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: process.env.FRONTEND_URL
      }
    });
    
    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }
    
    res.json({
      message: 'OAuth sign in initiated',
      url: data.url
    });
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({
      error: 'Failed to initiate OAuth sign in'
    });
  }
});

module.exports = router;