import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import CreateCharacterPage from './pages/CreateCharacterPage';
import CharacterDetailPage from './pages/CharacterDetailPage';
import PromptStorePage from './pages/PromptStorePage';
import PromptDetailPage from './pages/PromptDetailPage';

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:characterId" element={<ChatPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/create-character" element={<CreateCharacterPage />} />
            <Route path="/character/:id" element={<CharacterDetailPage />} />
            <Route path="/prompts" element={<PromptStorePage />} />
            <Route path="/prompt/:id" element={<PromptDetailPage />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;