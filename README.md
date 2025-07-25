[![Vercel](https://vercelbadge.vercel.app/api/prawat79/sage-ai)](https://vercel.com/prawat79/sage-ai)
[![Last Commit](https://img.shields.io/github/last-commit/yourusername/SAGE-AI)](https://github.com/yourusername/SAGE-AI)
[![License](https://img.shields.io/github/license/yourusername/SAGE-AI)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/yourusername/SAGE-AI?style=social)](https://github.com/yourusername/SAGE-AI/stargazers)

# Sage AI - Advanced AI Character Chat Platform

A cutting-edge web application for creating and chatting with AI characters, featuring multiple AI models and advanced conversation capabilities.

## ✨ Features

![Chat UI Demo](docs/chat-ui-demo.gif)

- 🤖 AI-powered character conversations
- 🎭 Create and customize AI characters
- 💬 Real-time chat with streaming responses
- 🧠 Character memory and personality persistence
- 😊 Emotional intelligence in responses
- 🎨 Beautiful and responsive UI
- 🔒 Secure authentication
- 📱 Mobile-friendly design

## Tech Stack

- Frontend: React, TailwindCSS, Vite
- Backend: Node.js, Express
- Database: Supabase (PostgreSQL)
- AI: OpenAI GPT-4
- Authentication: Supabase Auth
- Storage: Supabase Storage
- Real-time: Supabase Realtime

## Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/prawat79/SAGE-AI.git
cd ai-character-chat
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. Create a `.env` file in the root directory:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Feature Flags
VITE_ENABLE_STREAMING=true
VITE_ENABLE_VOICE_INPUT=false
VITE_ENABLE_IMAGE_GENERATION=false
VITE_ENABLE_VOICE_OUTPUT=false
VITE_ENABLE_EMOTION_DETECTION=true
VITE_ENABLE_CONVERSATION_SUMMARY=true
VITE_ENABLE_CHARACTER_MEMORY=true
```

> **Security Note:** Always add your `.env` file to `.gitignore` to prevent accidentally committing secrets to version control.
> **Note:** Voice input is currently disabled. To enable, implement a voice SDK (e.g., Web Speech API or Whisper) and set `VITE_ENABLE_VOICE_INPUT=true` in your .env.

4. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL migrations in `backend/database/migrations.sql`
   - Enable storage buckets for avatars and uploads
   - Configure authentication providers
   - Set up Row Level Security (RLS) policies

5. Start the development servers:
```bash
# Start frontend
npm run dev

# Start backend (in a separate terminal)
cd backend
npm run dev
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Characters Table
```sql
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  category TEXT NOT NULL,
  traits TEXT[],
  personality JSONB,
  memory JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  chat_count INTEGER DEFAULT 0,
  rating DECIMAL DEFAULT 0
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  character_id UUID REFERENCES characters(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/logout - Logout user
- GET /api/auth/me - Get current user

### Characters
- GET /api/characters - List characters
- POST /api/characters - Create character
- GET /api/characters/:id - Get character
- PUT /api/characters/:id - Update character
- DELETE /api/characters/:id - Delete character

### Conversations
- GET /api/conversations - List conversations
- POST /api/conversations - Create conversation
- GET /api/conversations/:id - Get conversation
- DELETE /api/conversations/:id - Delete conversation

### Messages
- GET /api/conversations/:id/messages - List messages
- POST /api/conversations/:id/messages - Send message
- DELETE /api/messages/:id - Delete message

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [FlowGPT](https://flowgpt.com) for inspiration
- [Character.ai](https://character.ai) for inspiration
- [Polybuzz](https://polybuzz.com) for inspiration