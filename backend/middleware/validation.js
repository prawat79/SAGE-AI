const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    throw new AppError('Validation failed', 400, errorDetails);
  }
  next();
};

// Common validation rules
const validationRules = {
  // User validation
  userSignup: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('username')
      .optional()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
    body('full_name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .trim()
      .withMessage('Full name must be 1-100 characters')
  ],

  userLogin: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  userProfile: [
    body('username')
      .optional()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
    body('full_name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .trim()
      .withMessage('Full name must be 1-100 characters'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .trim()
      .withMessage('Bio must be less than 500 characters'),
    body('avatar_url')
      .optional()
      .isURL()
      .withMessage('Avatar URL must be a valid URL'),
    body('website')
      .optional()
      .isURL()
      .withMessage('Website must be a valid URL'),
    body('location')
      .optional()
      .isLength({ max: 100 })
      .trim()
      .withMessage('Location must be less than 100 characters')
  ],

  // Character validation
  characterCreate: [
    body('name')
      .isLength({ min: 1, max: 100 })
      .trim()
      .withMessage('Character name is required and must be 1-100 characters'),
    body('description')
      .isLength({ min: 10, max: 1000 })
      .trim()
      .withMessage('Description must be 10-1000 characters'),
    body('personality')
      .isLength({ min: 10, max: 2000 })
      .trim()
      .withMessage('Personality must be 10-2000 characters'),
    body('scenario')
      .optional()
      .isLength({ max: 1000 })
      .trim()
      .withMessage('Scenario must be less than 1000 characters'),
    body('greeting_message')
      .optional()
      .isLength({ max: 500 })
      .trim()
      .withMessage('Greeting message must be less than 500 characters'),
    body('category')
      .isLength({ min: 1, max: 50 })
      .trim()
      .withMessage('Category is required and must be 1-50 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .isLength({ min: 1, max: 30 })
      .trim()
      .withMessage('Each tag must be 1-30 characters'),
    body('avatar_url')
      .optional()
      .isURL()
      .withMessage('Avatar URL must be a valid URL'),
    body('is_public')
      .optional()
      .isBoolean()
      .withMessage('is_public must be a boolean'),
    body('ai_provider')
      .optional()
      .isIn(['openai', 'anthropic'])
      .withMessage('AI provider must be either openai or anthropic'),
    body('ai_model')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('AI model must be 1-100 characters')
  ],

  characterUpdate: [
    body('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .trim()
      .withMessage('Character name must be 1-100 characters'),
    body('description')
      .optional()
      .isLength({ min: 10, max: 1000 })
      .trim()
      .withMessage('Description must be 10-1000 characters'),
    body('personality')
      .optional()
      .isLength({ min: 10, max: 2000 })
      .trim()
      .withMessage('Personality must be 10-2000 characters'),
    body('scenario')
      .optional()
      .isLength({ max: 1000 })
      .trim()
      .withMessage('Scenario must be less than 1000 characters'),
    body('greeting_message')
      .optional()
      .isLength({ max: 500 })
      .trim()
      .withMessage('Greeting message must be less than 500 characters'),
    body('category')
      .optional()
      .isLength({ min: 1, max: 50 })
      .trim()
      .withMessage('Category must be 1-50 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .isLength({ min: 1, max: 30 })
      .trim()
      .withMessage('Each tag must be 1-30 characters'),
    body('avatar_url')
      .optional()
      .isURL()
      .withMessage('Avatar URL must be a valid URL'),
    body('is_public')
      .optional()
      .isBoolean()
      .withMessage('is_public must be a boolean'),
    body('ai_provider')
      .optional()
      .isIn(['openai', 'anthropic'])
      .withMessage('AI provider must be either openai or anthropic'),
    body('ai_model')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('AI model must be 1-100 characters')
  ],

  // Conversation validation
  conversationCreate: [
    body('character_id')
      .isUUID()
      .withMessage('Valid character ID is required'),
    body('title')
      .optional()
      .isLength({ min: 1, max: 200 })
      .trim()
      .withMessage('Title must be 1-200 characters')
  ],

  conversationUpdate: [
    body('title')
      .optional()
      .isLength({ min: 1, max: 200 })
      .trim()
      .withMessage('Title must be 1-200 characters')
  ],

  // Chat validation
  chatMessage: [
    body('conversation_id')
      .isUUID()
      .withMessage('Valid conversation ID is required'),
    body('message')
      .isLength({ min: 1, max: 4000 })
      .trim()
      .withMessage('Message is required and must be 1-4000 characters'),
    body('ai_provider')
      .optional()
      .isIn(['openai', 'anthropic'])
      .withMessage('AI provider must be either openai or anthropic')
  ],

  chatRegenerate: [
    body('conversation_id')
      .isUUID()
      .withMessage('Valid conversation ID is required'),
    body('ai_provider')
      .optional()
      .isIn(['openai', 'anthropic'])
      .withMessage('AI provider must be either openai or anthropic')
  ],

  // Common parameter validation
  uuidParam: [
    param('id')
      .isUUID()
      .withMessage('Valid ID is required')
  ],

  usernameParam: [
    param('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Valid username is required')
  ],

  // Pagination validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  // Search validation
  search: [
    query('q')
      .isLength({ min: 1, max: 100 })
      .trim()
      .withMessage('Search query is required and must be 1-100 characters'),
    query('category')
      .optional()
      .isLength({ min: 1, max: 50 })
      .trim()
      .withMessage('Category must be 1-50 characters'),
    query('sort')
      .optional()
      .isIn(['newest', 'oldest', 'popular', 'rating', 'chat_count'])
      .withMessage('Sort must be one of: newest, oldest, popular, rating, chat_count')
  ]
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);

  next();
};

// File upload validation
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      if (file.size > maxSize) {
        throw new AppError(`File ${file.originalname} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`, 400);
      }

      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        throw new AppError(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`, 400);
      }
    }

    next();
  };
};

module.exports = {
  validationRules,
  handleValidationErrors,
  sanitizeInput,
  validateFileUpload
};