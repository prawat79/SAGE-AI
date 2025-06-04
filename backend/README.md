# FlowGPT Clone Backend

A Node.js/Express.js backend API for the FlowGPT Clone application, providing authentication, character management, conversations, and AI chat functionality.

## Features

- 🔐 **Authentication**: JWT-based auth with Supabase
- 👤 **User Management**: Profile management and user statistics
- 🤖 **Character System**: Create, manage, and interact with AI characters
- 💬 **Chat System**: Real-time conversations with AI characters
- 🔍 **Search & Discovery**: Advanced search and filtering
- 📊 **Analytics**: Usage statistics and insights
- 🛡️ **Security**: Rate limiting, input validation, and sanitization
- 📝 **Logging**: Structured logging with multiple levels

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Providers**: OpenAI, Anthropic
- **Validation**: express-validator
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Custom logger utility

## Project Structure

```
backend/
├── config/
│   ├── supabase.js         # Supabase configuration
│   └── ai.js               # AI providers configuration
├── database/
│   └── schema.sql          # Database schema
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── errorHandler.js     # Error handling middleware
│   └── validation.js       # Request validation middleware
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── characters.js       # Character management routes
│   ├── conversations.js    # Conversation management routes
│   ├── chat.js             # Chat functionality routes
│   └── users.js            # User management routes
├── utils/
│   ├── helpers.js          # Utility helper functions
│   └── logger.js           # Logging utility
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── server.js               # Main server file
└── README.md               # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- OpenAI API key (optional)
- Anthropic API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flowgpt-clone/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret
   
   # AI Provider Configuration
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

4. **Set up the database**
   
   Run the SQL schema in your Supabase dashboard:
   ```bash
   # Copy the contents of database/schema.sql
   # and run it in your Supabase SQL editor
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | User registration | No |
| POST | `/signin` | User login | No |
| POST | `/signout` | User logout | Yes |
| GET | `/me` | Get current user | Yes |
| POST | `/refresh` | Refresh session | Yes |
| POST | `/reset-password` | Reset password | No |
| POST | `/update-password` | Update password | Yes |
| POST | `/oauth/:provider` | OAuth sign-in | No |

#### Character Routes (`/api/characters`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all characters | No |
| GET | `/featured` | Get featured characters | No |
| GET | `/categories` | Get character categories | No |
| GET | `/:id` | Get character by ID | No |
| POST | `/` | Create new character | Yes |
| PUT | `/:id` | Update character | Yes (Owner) |
| DELETE | `/:id` | Delete character | Yes (Owner) |
| POST | `/:id/like` | Like/unlike character | Yes |

#### Conversation Routes (`/api/conversations`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user conversations | Yes |
| GET | `/:id` | Get conversation by ID | Yes (Owner) |
| POST | `/` | Create new conversation | Yes |
| PUT | `/:id` | Update conversation | Yes (Owner) |
| DELETE | `/:id` | Delete conversation | Yes (Owner) |
| DELETE | `/:id/messages` | Clear conversation messages | Yes (Owner) |
| GET | `/:id/stats` | Get conversation statistics | Yes (Owner) |

#### Chat Routes (`/api/chat`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/message` | Send chat message | Yes |
| GET | `/:conversationId/messages` | Get conversation messages | Yes (Owner) |
| DELETE | `/messages/:messageId` | Delete message | Yes (Owner) |
| POST | `/regenerate` | Regenerate last response | Yes |
| POST | `/typing` | Send typing indicator | Yes |

#### User Routes (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get current user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| GET | `/stats` | Get user statistics | Yes |
| GET | `/characters` | Get user's characters | Yes |
| GET | `/liked-characters` | Get user's liked characters | Yes |
| GET | `/activity` | Get user activity | Yes |
| GET | `/search` | Search users | No |
| GET | `/:username` | Get public user profile | No |
| GET | `/:username/characters` | Get user's public characters | No |

### Request/Response Examples

#### Create Character
```bash
POST /api/characters
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Helpful Assistant",
  "description": "A friendly AI assistant ready to help with any task",
  "personality": "Helpful, friendly, and knowledgeable",
  "scenario": "You are a helpful AI assistant",
  "greeting_message": "Hello! How can I help you today?",
  "category": "Assistant",
  "tags": ["helpful", "friendly", "assistant"],
  "ai_provider": "openai",
  "ai_model": "gpt-3.5-turbo"
}
```

#### Send Chat Message
```bash
POST /api/chat/message
Content-Type: application/json
Authorization: Bearer <token>

{
  "conversationId": "uuid-here",
  "message": "Hello, how are you?"
}
```

#### Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|----------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment | No | development |
| `SUPABASE_URL` | Supabase project URL | Yes | - |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `OPENAI_API_KEY` | OpenAI API key | No | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | No | - |
| `GOOGLE_AI_API_KEY` | Google AI API key | No | - |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | 100 |
| `CHAT_RATE_LIMIT_MAX` | Max chat requests per window | No | 20 |
| `MAX_FILE_SIZE` | Max upload file size | No | 5242880 |
| `UPLOAD_DIR` | Upload directory | No | uploads |
| `LOG_LEVEL` | Logging level | No | INFO |
| `ENABLE_FILE_LOGGING` | Enable file logging | No | false |
| `LOG_DIR` | Log directory | No | logs |

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Chat API**: 20 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Request validation and sanitization
- **JWT Authentication**: Secure token-based auth
- **Row Level Security**: Database-level access control

## Logging

The application uses structured logging with the following levels:
- **ERROR**: Error conditions
- **WARN**: Warning conditions
- **INFO**: Informational messages
- **DEBUG**: Debug-level messages

Logs include:
- Request/response logging
- Authentication events
- Database queries
- AI API calls
- Security events

## Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Database Migrations

To update the database schema:

1. Modify `database/schema.sql`
2. Run the updated SQL in Supabase dashboard
3. Test the changes locally

### Adding New Routes

1. Create route file in `routes/` directory
2. Add validation rules in `middleware/validation.js`
3. Import and use in `server.js`
4. Update this README with new endpoints

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set secure JWT secret
- [ ] Configure AI API keys
- [ ] Set up proper logging
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Configure CORS for production domains

### Environment Setup

1. **Supabase Production**
   - Create production project
   - Run schema migrations
   - Configure RLS policies
   - Set up backups

2. **Server Deployment**
   - Deploy to your preferred platform (Heroku, Railway, etc.)
   - Set environment variables
   - Configure health checks
   - Set up monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API examples

---

**Note**: This is a development version. Make sure to properly configure security settings and environment variables for production use.