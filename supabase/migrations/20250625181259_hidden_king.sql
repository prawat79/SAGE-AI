/*
  # Sage AI Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (varchar, unique)
      - `full_name` (varchar)
      - `bio` (text)
      - `avatar_url` (text)
      - `website` (text)
      - `location` (varchar)
      - `is_public` (boolean)
      - `preferences` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `characters`
      - `id` (uuid, primary key)
      - `name` (varchar)
      - `description` (text)
      - `personality` (text)
      - `scenario` (text)
      - `greeting_message` (text)
      - `category` (varchar)
      - `tags` (text array)
      - `avatar_url` (text)
      - `is_public` (boolean)
      - `ai_provider` (varchar)
      - `ai_model` (varchar)
      - `created_by` (uuid, references auth.users)
      - `view_count` (integer)
      - `chat_count` (integer)
      - `like_count` (integer)
      - `rating` (decimal)
      - `rating_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `character_id` (uuid, references characters)
      - `title` (varchar)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `role` (varchar, check constraint)
      - `content` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamp)

    - `character_likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `character_id` (uuid, references characters)
      - `created_at` (timestamp)
      - Unique constraint on (user_id, character_id)

    - `character_ratings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `character_id` (uuid, references characters)
      - `rating` (integer, check constraint 1-5)
      - `review` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - Unique constraint on (user_id, character_id)

    - `character_categories`
      - `id` (uuid, primary key)
      - `name` (varchar, unique)
      - `description` (text)
      - `icon` (varchar)
      - `color` (varchar)
      - `is_active` (boolean)
      - `sort_order` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public access to characters and categories
    - Add policies for conversation and message access control

  3. Functions and Triggers
    - `update_updated_at_column()` function for automatic timestamp updates
    - `update_character_stats()` function for maintaining character statistics
    - `handle_new_user()` function for creating user profiles on signup
    - `get_character_stats()` function for character analytics
    - `search_characters()` function for full-text search
    - Triggers for automatic updates and user profile creation

  4. Indexes
    - Performance indexes on frequently queried columns
    - Full-text search indexes for characters and user profiles
    - Foreign key indexes for join performance

  5. Default Data
    - Character categories with Sage AI appropriate categories
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(30) UNIQUE,
    full_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    website TEXT,
    location VARCHAR(100),
    is_public BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Characters Table
CREATE TABLE IF NOT EXISTS characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    personality TEXT NOT NULL,
    scenario TEXT,
    greeting_message TEXT,
    category VARCHAR(50) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    is_public BOOLEAN DEFAULT true,
    ai_provider VARCHAR(20) DEFAULT 'openai',
    ai_model VARCHAR(100),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    view_count INTEGER DEFAULT 0,
    chat_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character Likes Table
CREATE TABLE IF NOT EXISTS character_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, character_id)
);

-- Character Ratings Table
CREATE TABLE IF NOT EXISTS character_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, character_id)
);

-- Character Categories Table (for predefined categories)
CREATE TABLE IF NOT EXISTS character_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- hex color code
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_characters_created_by ON characters(created_by);
CREATE INDEX IF NOT EXISTS idx_characters_category ON characters(category);
CREATE INDEX IF NOT EXISTS idx_characters_is_public ON characters(is_public);
CREATE INDEX IF NOT EXISTS idx_characters_created_at ON characters(created_at);
CREATE INDEX IF NOT EXISTS idx_characters_view_count ON characters(view_count);
CREATE INDEX IF NOT EXISTS idx_characters_chat_count ON characters(chat_count);
CREATE INDEX IF NOT EXISTS idx_characters_like_count ON characters(like_count);
CREATE INDEX IF NOT EXISTS idx_characters_rating ON characters(rating);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_character_id ON conversations(character_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);

CREATE INDEX IF NOT EXISTS idx_character_likes_user_id ON character_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_character_likes_character_id ON character_likes(character_id);

CREATE INDEX IF NOT EXISTS idx_character_ratings_character_id ON character_ratings(character_id);
CREATE INDEX IF NOT EXISTS idx_character_ratings_rating ON character_ratings(rating);

CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_public ON user_profiles(is_public);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_characters_search ON characters USING gin(to_tsvector('english', name || ' ' || description || ' ' || personality));
CREATE INDEX IF NOT EXISTS idx_user_profiles_search ON user_profiles USING gin(to_tsvector('english', COALESCE(username, '') || ' ' || COALESCE(full_name, '')));

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_character_ratings_updated_at BEFORE UPDATE ON character_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update character statistics
CREATE OR REPLACE FUNCTION update_character_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update like count
        IF TG_TABLE_NAME = 'character_likes' THEN
            UPDATE characters 
            SET like_count = like_count + 1 
            WHERE id = NEW.character_id;
        END IF;
        
        -- Update rating
        IF TG_TABLE_NAME = 'character_ratings' THEN
            UPDATE characters 
            SET 
                rating = (
                    SELECT AVG(rating)::DECIMAL(3,2) 
                    FROM character_ratings 
                    WHERE character_id = NEW.character_id
                ),
                rating_count = (
                    SELECT COUNT(*) 
                    FROM character_ratings 
                    WHERE character_id = NEW.character_id
                )
            WHERE id = NEW.character_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        -- Update like count
        IF TG_TABLE_NAME = 'character_likes' THEN
            UPDATE characters 
            SET like_count = like_count - 1 
            WHERE id = OLD.character_id;
        END IF;
        
        -- Update rating
        IF TG_TABLE_NAME = 'character_ratings' THEN
            UPDATE characters 
            SET 
                rating = COALESCE(
                    (SELECT AVG(rating)::DECIMAL(3,2) 
                     FROM character_ratings 
                     WHERE character_id = OLD.character_id), 
                    0.00
                ),
                rating_count = (
                    SELECT COUNT(*) 
                    FROM character_ratings 
                    WHERE character_id = OLD.character_id
                )
            WHERE id = OLD.character_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'character_ratings' THEN
        UPDATE characters 
        SET 
            rating = (
                SELECT AVG(rating)::DECIMAL(3,2) 
                FROM character_ratings 
                WHERE character_id = NEW.character_id
            )
        WHERE id = NEW.character_id;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers for updating character statistics
CREATE TRIGGER update_character_like_stats 
    AFTER INSERT OR DELETE ON character_likes 
    FOR EACH ROW EXECUTE FUNCTION update_character_stats();

CREATE TRIGGER update_character_rating_stats 
    AFTER INSERT OR UPDATE OR DELETE ON character_ratings 
    FOR EACH ROW EXECUTE FUNCTION update_character_stats();

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_ratings ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view public profiles" ON user_profiles
    FOR SELECT USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Characters Policies
CREATE POLICY "Anyone can view public characters" ON characters
    FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create characters" ON characters
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own characters" ON characters
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own characters" ON characters
    FOR DELETE USING (auth.uid() = created_by);

-- Conversations Policies
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Messages Policies
CREATE POLICY "Users can view messages in own conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in own conversations" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in own conversations" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages in own conversations" ON messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = messages.conversation_id 
            AND conversations.user_id = auth.uid()
        )
    );

-- Character Likes Policies
CREATE POLICY "Users can view all character likes" ON character_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can create own likes" ON character_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON character_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Character Ratings Policies
CREATE POLICY "Users can view all character ratings" ON character_ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can create own ratings" ON character_ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON character_ratings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" ON character_ratings
    FOR DELETE USING (auth.uid() = user_id);

-- Character Categories Policies (public read-only)
CREATE POLICY "Anyone can view character categories" ON character_categories
    FOR SELECT USING (is_active = true);

-- Insert default character categories for Sage AI
INSERT INTO character_categories (name, description, icon, color, sort_order) VALUES
('AI Assistant', 'Intelligent AI assistants for productivity and support', '🤖', '#3B82F6', 1),
('Sage Companion', 'Wise companions for meaningful conversations', '🧙‍♂️', '#10B981', 2),
('Creative Muse', 'Creative partners for writing and artistic endeavors', '✨', '#8B5CF6', 3),
('Knowledge Guide', 'Educational mentors and learning assistants', '📚', '#F59E0B', 4),
('Entertainment', 'Fun and engaging characters for leisure', '🎭', '#EF4444', 5),
('Professional', 'Business and career-focused assistants', '💼', '#6B7280', 6),
('Gaming Buddy', 'Gaming companions and roleplay characters', '🎮', '#EC4899', 7),
('Wellness Coach', 'Health, fitness, and mindfulness guides', '🌱', '#14B8A6', 8),
('Fantasy Realm', 'Magical and fantastical characters', '🏰', '#7C3AED', 9),
('Anime World', 'Anime and manga inspired characters', '🌸', '#F97316', 10)
ON CONFLICT (name) DO NOTHING;

-- Function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get character statistics
CREATE OR REPLACE FUNCTION get_character_stats(character_uuid UUID)
RETURNS TABLE(
    total_conversations BIGINT,
    total_messages BIGINT,
    avg_conversation_length NUMERIC,
    unique_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT c.id) as total_conversations,
        COUNT(m.id) as total_messages,
        CASE 
            WHEN COUNT(DISTINCT c.id) > 0 
            THEN COUNT(m.id)::NUMERIC / COUNT(DISTINCT c.id)
            ELSE 0
        END as avg_conversation_length,
        COUNT(DISTINCT c.user_id) as unique_users
    FROM conversations c
    LEFT JOIN messages m ON c.id = m.conversation_id
    WHERE c.character_id = character_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to search characters with full-text search
CREATE OR REPLACE FUNCTION search_characters(
    search_query TEXT,
    category_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    name VARCHAR(100),
    description TEXT,
    category VARCHAR(50),
    avatar_url TEXT,
    chat_count INTEGER,
    like_count INTEGER,
    rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.description,
        c.category,
        c.avatar_url,
        c.chat_count,
        c.like_count,
        c.rating,
        c.created_at,
        ts_rank(to_tsvector('english', c.name || ' ' || c.description || ' ' || c.personality), plainto_tsquery('english', search_query)) as rank
    FROM characters c
    WHERE 
        c.is_public = true
        AND (
            category_filter IS NULL 
            OR c.category = category_filter
        )
        AND (
            search_query = '' 
            OR to_tsvector('english', c.name || ' ' || c.description || ' ' || c.personality) @@ plainto_tsquery('english', search_query)
        )
    ORDER BY 
        CASE WHEN search_query = '' THEN 0 ELSE ts_rank(to_tsvector('english', c.name || ' ' || c.description || ' ' || c.personality), plainto_tsquery('english', search_query)) END DESC,
        c.chat_count DESC,
        c.like_count DESC,
        c.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;