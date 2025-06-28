import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Star, MessageCircle, Calendar, User, TrendingUp, Sparkles, Heart, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CharacterService } from '../services/characterService';
import ConversationService from '../services/conversationService';

const CharacterCard = ({ character, onStartChat }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const handleViewDetails = () => {
    navigate(`/character/${character.id}`);
  };

  const handleStartChat = (e) => {
    e.stopPropagation();
    if (onStartChat) {
      onStartChat(character);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <div 
      className="card p-6 hover-lift group cursor-pointer animate-fade-in"
      onClick={handleViewDetails}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={character.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name}`}
              alt={character.name}
              className="w-16 h-16 rounded-full border-2 border-purple-500/30 group-hover:border-purple-500/60 transition-colors"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:gradient-text transition-all">
              {character.name}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                {character.category}
              </span>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-400">{character.rating || 4.5}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLike}
          className={`p-2 rounded-full transition-colors ${
            isLiked 
              ? 'text-red-400 bg-red-500/20' 
              : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {character.description}
      </p>
      
      {/* Tags */}
      {character.tags && character.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {character.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-md"
            >
              #{tag}
            </span>
          ))}
          {character.tags.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-md">
              +{character.tags.length - 3}
            </span>
          )}
        </div>
      )}
      
      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-3 w-3" />
            <span>{(character.chat_count || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>{Math.floor(Math.random() * 5000) + 1000}</span>
          </div>
        </div>
        <span>{new Date(character.created_at).toLocaleDateString()}</span>
      </div>
      
      {/* Action Button */}
      <button
        onClick={handleStartChat}
        className="w-full btn-primary py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
      >
        <MessageCircle className="h-4 w-4" />
        <span>Start Chat</span>
      </button>
    </div>
  );
};

const ExplorePage = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [viewMode, setViewMode] = useState('grid');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCharacters();
  }, [filters]);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await CharacterService.getCharacters({
        search: filters.search,
        category: filters.category,
        limit: 20
      });
      setCharacters(response.data || []);
    } catch (err) {
      console.error('Error fetching characters:', err);
      setError('Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleStartChat = async (character) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const conversation = await ConversationService.createConversation(
        user.id,
        character.id,
        `Chat with ${character.name}`,
        user.access_token
      );
      
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Anime', label: 'Anime' },
    { value: 'Game', label: 'Game' },
    { value: 'Fictional', label: 'Fictional' },
    { value: 'Historical', label: 'Historical' },
    { value: 'Celebrity', label: 'Celebrity' },
    { value: 'Original', label: 'Original' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20">
      {/* Header */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 glass rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-300">Discover AI Characters</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Explore
            <span className="gradient-text"> AI Characters</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover thousands of unique AI characters with distinct personalities, 
            backgrounds, and conversation styles. Find your perfect chat companion.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search characters by name, description, or tags..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full input-glass rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-400 focus-ring"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-glass rounded-xl px-4 py-4 text-white focus-ring"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value} className="bg-gray-800">
                    {category.label}
                  </option>
                ))}
              </select>
              
              <div className="flex border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-4 transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-4 transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">
                {characters.length} characters found
              </span>
              {filters.search && (
                <span className="text-sm text-purple-400">
                  for "{filters.search}"
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Trending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Characters Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {[...Array(12)].map((_, index) => (
              <div key={index} className="card p-6 animate-pulse">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded mb-4 w-3/4"></div>
                <div className="h-10 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchCharacters}
              className="btn-primary px-6 py-3 rounded-xl font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No characters found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filters.</p>
            <button
              onClick={() => setFilters({ search: '', category: '', sortBy: 'created_at', sortOrder: 'desc' })}
              className="btn-secondary px-6 py-3 rounded-xl font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}>
            {characters.map((character, index) => (
              <CharacterCard
                key={character.id}
                character={character}
                onStartChat={handleStartChat}
                style={{ animationDelay: `${index * 0.05}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;