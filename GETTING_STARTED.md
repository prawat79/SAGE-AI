# Getting Started with Sage AI

## Project Overview

Sage AI is an advanced AI character chat platform built using modern web technologies. The application features intelligent AI character interactions, user authentication, multiple AI models, and community features.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js and npm**: Required for running the development server and building the project
- **Git**: Required for version control

If you haven't installed these prerequisites yet, please refer to the `INSTALLATION_GUIDE.md` file for detailed installation instructions.

## Quick Start

1. **Run the setup script**
   ```
   setup.bat
   ```
   This script will check if you have the required prerequisites installed and guide you through the project setup process.

2. **Start the development server**
   ```
   npm run dev
   ```
   This will start the Vite development server, and you can access your application at http://localhost:5173

## Project Structure

After setup, your project will have the following structure:

```
flowgpt-clone/
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── layout/
│   │   └── prompts/
│   ├── contexts/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Key Features to Implement

1. **Chat Interface**
   - Real-time conversation with AI
   - Message history
   - Code highlighting
   - Markdown support

2. **User Authentication**
   - Email/password login
   - Social login (Google, GitHub)
   - User profiles

3. **Prompt Templates**
   - Pre-defined prompts by category
   - User-created prompts
   - Rating system

4. **Community Features**
   - Sharing prompts
   - Upvoting/downvoting
   - Comments

## Next Steps

1. Set up your Supabase project and update the `.env` file with your credentials
2. Implement the basic layout components (Header, Sidebar, Chat interface)
3. Add authentication functionality
4. Develop the chat interface with AI integration
5. Implement prompt templates and community features

Refer to the `README.md` file for detailed project architecture and implementation steps.

## Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.io/docs)

Happy coding!