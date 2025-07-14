import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Star, MessageCircle, Calendar, User, TrendingUp, Sparkles, Heart, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CharacterService } from '../services/characterService';
import ConversationService from '../services/conversationService';
import MainLayout from "@/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export default function ExplorePage() {
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
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Explore AI Characters</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Card key={character.id} className="flex flex-col items-center p-6">
              <img src={character.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name}`} alt={character.name} className="w-16 h-16 rounded-full mb-4" />
              <h2 className="text-xl font-semibold mb-2">{character.name}</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-3">{character.description}</p>
              <Button asChild>
                <a href={`/characters/${character.id}`}>View Details</a>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}