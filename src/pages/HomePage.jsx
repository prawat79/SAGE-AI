import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Zap, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CharacterService } from '../services/characterService';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredCharacters, setFeaturedCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats] = useState({
    totalCharacters: 1250,
    totalConversations: 45000,
    activeUsers: 8500
  });

  useEffect(() => {
    loadFeaturedCharacters();
  }, []);

  const loadFeaturedCharacters = async () => {
    try {
      const response = await CharacterService.getCharacters({
        limit: 6
      });
      setFeaturedCharacters(response.data || []);
    } catch (error) {
      console.error('Error loading featured characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (character) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // For demo purposes, navigate directly to explore page
      navigate('/explore');
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Chat with AI
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Characters
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover thousands of AI characters, each with unique personalities, 
              backstories, and conversation styles. Start meaningful conversations today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/explore"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Start Chatting
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              {!user && (
                <Link
                  to="/signup"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Sign Up Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalCharacters.toLocaleString()}+
              </h3>
              <p className="text-gray-600">AI Characters</p>
            </div>
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <MessageCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalConversations.toLocaleString()}+
              </h3>
              <p className="text-gray-600">Conversations</p>
            </div>
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.activeUsers.toLocaleString()}+
              </h3>
              <p className="text-gray-600">Active Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Characters */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Characters
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet some of our most popular AI characters, ready to chat about anything
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCharacters.map((character) => (
                <div
                  key={character.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={character.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name}`}
                      alt={character.name}
                      className="w-16 h-16 rounded-full bg-gray-100 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {character.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {character.category}
                      </p>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {character.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">
                            {character.rating || '4.8'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleStartChat(character)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Chat Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/explore"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explore All Characters
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of AI conversation with advanced features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Instant Responses
              </h3>
              <p className="text-gray-600">
                Get immediate, intelligent responses from AI characters with advanced language models
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Diverse Characters
              </h3>
              <p className="text-gray-600">
                Choose from thousands of unique AI personalities, each with distinct traits and knowledge
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Natural Conversations
              </h3>
              <p className="text-gray-600">
                Enjoy fluid, context-aware conversations that feel natural and engaging
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Chatting?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users already having amazing conversations with AI characters
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Browse Characters
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;