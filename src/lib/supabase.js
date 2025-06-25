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
  }
});

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://demo.supabase.co' && 
         supabaseAnonKey !== 'demo-key' &&
         import.meta.env.VITE_SUPABASE_URL &&
         import.meta.env.VITE_SUPABASE_ANON_KEY;
};

// Database table schemas
export const TABLES = {
  CHARACTERS: 'characters',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  USERS: 'users'
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