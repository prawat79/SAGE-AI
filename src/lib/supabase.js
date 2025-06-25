import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback for demo mode
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://demo.supabase.co' && 
         supabaseAnonKey !== 'demo-key' &&
         import.meta.env.VITE_SUPABASE_URL &&
         import.meta.env.VITE_SUPABASE_ANON_KEY;
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'An error occurred with the database');
};

// Helper function to handle Supabase responses
export const handleSupabaseResponse = (response) => {
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data;
};

// Helper function to handle Supabase realtime subscriptions
export const subscribeToChanges = (table, callback) => {
  return supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
};

// Helper function to handle file uploads
export const uploadFile = async (bucket, path, file) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Helper function to get public URL for uploaded files
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

// Helper function to handle database transactions
export const transaction = async (operations) => {
  try {
    const { data, error } = await supabase.rpc('transaction', { operations });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in transaction:', error);
    throw error;
  }
};

// Helper function to handle database queries with pagination
export const paginatedQuery = async (table, options = {}) => {
  const {
    page = 1,
    pageSize = 10,
    filters = {},
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options;

  try {
    let query = supabase
      .from(table)
      .select('*', { count: 'exact' });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query = query.eq(key, value);
      }
    });

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data,
      count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    };
  } catch (error) {
    console.error('Error in paginated query:', error);
    throw error;
  }
};

// Database table schemas
export const TABLES = {
  CHARACTERS: 'characters',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  USERS: 'users',
  PROMPTS: 'prompts'
};

// Character categories
export const CHARACTER_CATEGORIES = {
  ANIME: 'Anime',
  GAME: 'Game',
  CELEBRITY: 'Celebrity',
  FICTIONAL: 'Fictional',
  HISTORICAL: 'Historical',
  ORIGINAL: 'Original Character'
};

// Character traits
export const CHARACTER_TRAITS = {
  DOMINANT: 'Dominant',
  SUBMISSIVE: 'Submissive',
  ROMANTIC: 'Romantic',
  FRIENDLY: 'Friendly',
  MYSTERIOUS: 'Mysterious',
  CARING: 'Caring',
  TSUNDERE: 'Tsundere',
  YANDERE: 'Yandere',
  COLD: 'Cold',
  ENERGETIC: 'Energetic'
};