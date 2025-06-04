const { validateUserSession } = require('../config/supabase');

// Middleware to require authentication
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authorization header is required'
      });
    }
    
    const user = await validateUserSession(authHeader);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      error: error.message || 'Authentication failed'
    });
  }
};

// Middleware for optional authentication (doesn't fail if no auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const user = await validateUserSession(authHeader);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Don't fail the request, just continue without user
    console.warn('Optional auth failed:', error.message);
    next();
  }
};

// Middleware to check if user owns a resource
const requireOwnership = (resourceField = 'created_by') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }
    
    const resourceOwnerId = req.resource?.[resourceField] || req.body?.[resourceField];
    
    if (!resourceOwnerId) {
      return res.status(400).json({
        error: 'Resource ownership cannot be determined'
      });
    }
    
    if (resourceOwnerId !== req.user.id) {
      return res.status(403).json({
        error: 'You do not have permission to access this resource'
      });
    }
    
    next();
  };
};

// Middleware to check admin privileges
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }
  
  // Check if user has admin role (you'll need to implement this in your user profile)
  if (!req.user.is_admin) {
    return res.status(403).json({
      error: 'Admin privileges required'
    });
  }
  
  next();
};

module.exports = {
  requireAuth,
  optionalAuth,
  requireOwnership,
  requireAdmin
};