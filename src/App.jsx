import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ChatPage from './pages/ChatPage';
import CharacterDetailPage from './pages/CharacterDetailPage';
import CreateCharacterPage from './pages/CreateCharacterPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PromptStorePage from './pages/PromptStorePage';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/prompts" element={<PromptStorePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />
            <Route path="/character/:id" element={<CharacterDetailPage />} />
            <Route path="/create-character" element={<CreateCharacterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;