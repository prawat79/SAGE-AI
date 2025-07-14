import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import CharacterDetailPage from './pages/CharacterDetailPage';
import CreateCharacterPage from './pages/CreateCharacterPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PromptStorePage from './pages/PromptStorePage';
import AuthCallbackPage from './pages/AuthCallbackPage';

const ExplorePage = React.lazy(() => import('./pages/ExplorePage'));

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={
              <Suspense fallback={<div className="p-8 text-center">Loading Explore...</div>}>
                <ExplorePage />
              </Suspense>
            } />
            <Route path="/prompts" element={<PromptStorePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />
            <Route path="/character/:id" element={<CharacterDetailPage />} />
            <Route path="/create-character" element={<CreateCharacterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;