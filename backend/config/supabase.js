const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client for general operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

// Create admin client for service operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

// Database table names
const TABLES = {
  USERS: 'users',
  CHARACTERS: 'characters',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  USER_PREFERENCES: 'user_preferences',
  CHARACTER_CATEGORIES: 'character_categories'
};

// Helper function to handle Supabase errors
const handleSupabaseError = (error, operation = 'database operation') => {
  console.error(`Supabase error during ${operation}:`, error);
  
  if (error.code === 'PGRST116') {
    throw new Error('Resource not found');
  }
  
  if (error.code === '23505') {
    throw new Error('Resource already exists');
  }
  
  if (error.code === '42501') {
    throw new Error('Insufficient permissions');
  }
  
  throw new Error(error.message || `Failed to perform ${operation}`);
};

// Helper function to validate user session
const validateUserSession = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.substring(7);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid or expired token');
  }
  
  return user;
};

// Helper function to get user profile
const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    handleSupabaseError(error, 'get user profile');
  }
  
  return data;
};

// Helper function to create or update user profile
const upsertUserProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .upsert({
      id: userId,
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    handleSupabaseError(error, 'upsert user profile');
  }
  
  return data;
};

module.exports = {
  supabase,
  supabaseAdmin,
  TABLES,
  handleSupabaseError,
  validateUserSession,
  getUserProfile,
  upsertUserProfile
};