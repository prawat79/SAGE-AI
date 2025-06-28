import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Zap, ArrowRight, Star, TrendingUp, Sparkles, Bot, Rocket, Globe } from 'lucide-react';
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
    navigate('/explore');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 glass rounded-full px-4 py-2 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
              <span className="text-white">Chat with</span>
              <br />
              <span className="gradient-text">AI Characters</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in">
              Experience the future of AI conversation. Discover thousands of unique characters, 
              each with distinct personalities and endless possibilities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up">
              <Link
                to="/explore"
                className="btn-primary px-8 py-4 rounded-full text-lg font-semibold flex items-center justify-center space-x-2 hover-lift"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Start Chatting</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              {!user && (
                <Link
                  to="/signup"
                  className="btn-secondary px-8 py-4 rounded-full text-lg font-semibold flex items-center justify-center space-x-2 hover-lift"
                >
                  <Rocket className="h-5 w-5" />
                  <span>Join Free</span>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stats.totalCharacters.toLocaleString()}+
                </div>
                <div className="text-gray-400">AI Characters</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stats.totalConversations.toLocaleString()}+
                </div>
                <div className="text-gray-400">Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stats.activeUsers.toLocaleString()}+
                </div>
                <div className="text-gray-400">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Characters */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 glass rounded-full px-4 py-2 mb-6">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Featured Characters</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Meet Your New
              <span className="gradient-text"> AI Companions</span>
            </h2>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Discover our most popular AI characters, each with unique personalities and expertise
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="w-16 h-16 bg-gray-700 rounded-full mb-4"></div>
                  <div className="h-6 bg-gray-700 rounded mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-10 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCharacters.map((character, index) => (
                <div
                  key={character.id}
                  className="card p-6 hover-lift group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="relative">
                      <img
                        src={character.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name}`}
                        alt={character.name}
                        className="w-16 h-16 rounded-full border-2 border-purple-500/30 group-hover:border-purple-500/60 transition-colors"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:gradient-text transition-all">
                        {character.name}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                          {character.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-400">{character.rating || '4.8'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                    {character.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{(character.chat_count || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{Math.floor(Math.random() * 1000) + 100}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleStartChat(character)}
                    className="w-full btn-primary py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Start Chat</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/explore"
              className="btn-secondary px-8 py-4 rounded-full font-semibold flex items-center justify-center space-x-2 mx-auto w-fit hover-lift"
            >
              <Globe className="h-5 w-5" />
              <span>Explore All Characters</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose
              <span className="gradient-text"> Sage AI</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the most advanced AI conversation platform with cutting-edge features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center hover-lift group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Lightning Fast
              </h3>
              <p className="text-gray-400">
                Get instant, intelligent responses powered by the latest AI models with sub-second response times
              </p>
            </div>
            
            <div className="card p-8 text-center hover-lift group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Diverse Characters
              </h3>
              <p className="text-gray-400">
                Choose from thousands of unique AI personalities, each with distinct traits, knowledge, and conversation styles
              </p>
            </div>
            
            <div className="card p-8 text-center hover-lift group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Natural Conversations
              </h3>
              <p className="text-gray-400">
                Enjoy fluid, context-aware conversations that feel natural and engaging with advanced memory capabilities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 relative">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your
              <span className="gradient-text"> AI Journey</span>?
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Join thousands of users already having amazing conversations with AI characters
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="btn-primary px-8 py-4 rounded-full text-lg font-semibold flex items-center justify-center space-x-2 hover-lift"
              >
                <Rocket className="h-5 w-5" />
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/explore"
                className="btn-secondary px-8 py-4 rounded-full text-lg font-semibold flex items-center justify-center space-x-2 hover-lift"
              >
                <Globe className="h-5 w-5" />
                <span>Browse Characters</span>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;