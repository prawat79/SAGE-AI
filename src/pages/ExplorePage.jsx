import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Star, MessageCircle, Calendar, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CharacterService } from '../services/characterService';
import ConversationService from '../services/conversationService';

const CharacterCard = ({ character, onStartChat }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/character/${character.id}`);
  };

  const handleStartChat = (e) => {
    e.stopPropagation();
    if (onStartChat) {
      onStartChat(character);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex-shrink-0">
            <img
              src={character.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name}`}
              alt={character.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                {character.category}
              </span>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{character.rating || 4.5}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors group-hover:text-blue-600">
              {character.name}
            </h3>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {character.description}
        </p>
        
        {character.personality && (
          <p className="text-gray-500 text-xs mb-4 italic">
            Personality: {character.personality}
          </p>
        )}
        
        {character.tags && character.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {character.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
              >
                #{tag}
              </span>
            ))}
            {character.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">
                +{character.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        <button
          onClick={handleStartChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Start Chat
        </button>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(character.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{character.chat_count || 0} chats</span>
            </div>
          </div>
        </div>
      </div>
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
      // Create a new conversation
      const conversation = await ConversationService.createConversation(
        user.id,
        character.id,
        `Chat with ${character.name}`
      );
      
      // Navigate to chat page
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Explore AI Characters
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover and chat with thousands of AI characters. From anime heroes to historical figures,
              find the perfect conversation partner.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search characters..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {characters.length} characters found
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Characters Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchCharacters}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No characters found</h3>
            <p className="text-gray-600">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onStartChat={handleStartChat}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;