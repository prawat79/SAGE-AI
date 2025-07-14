import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CharacterService } from '../services/characterService';
import ConversationService from '../services/conversationService';
import { MessageCircle, Heart, Share2, Star, Users, Calendar, Tag } from 'lucide-react';
import Comments from "@/components/Comments";

const CharacterDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setLoading(true);
        const characterData = await CharacterService.getCharacterById(id);
        if (characterData) {
          setCharacter(characterData);
        } else {
          setError('Character not found');
        }
      } catch (err) {
        setError('Failed to load character');
        console.error('Error fetching character:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCharacter();
    }
  }, [id]);

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setIsStartingChat(true);
      
      // Create new conversation
      const conversation = await ConversationService.createConversation(
        user.id,
        character.id,
        `Chat with ${character.name}`,
        user.access_token
      );
      
      // Navigate to chat page
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      setError('Failed to start chat. Please try again.');
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsLiked(!isLiked);
    // TODO: Implement like functionality with backend
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: character.name,
        text: character.description,
        url: window.location.href
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleAddComment = (text) => {
    setComments((prev) => [...prev, { user: "Anonymous", text }]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Character not found'}
          </h2>
          <button
            onClick={() => navigate('/explore')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Character Avatar */}
            <div className="flex-shrink-0">
              <img
                src={character.avatar_url || '/api/placeholder/200/200'}
                alt={character.name}
                className="w-48 h-48 rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>
            
            {/* Character Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-bold mb-4">{character.name}</h1>
              <p className="text-xl mb-6 opacity-90">{character.description}</p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>{character.chat_count || 0} chats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span>{character.likes || 0} likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>{character.rating || 4.5} rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{character.category}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <button
                  onClick={handleStartChat}
                  disabled={isStartingChat}
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  {isStartingChat ? 'Starting...' : 'Start Chat'}
                </button>
                
                <button
                  onClick={handleLike}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    isLiked
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </button>
                
                <button
                  onClick={handleShare}
                  className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* About */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {character.name}</h2>
              <p className="text-gray-700 leading-relaxed">
                {character.personality || character.description}
              </p>
            </div>
            
            {/* Personality Traits */}
            {character.traits && character.traits.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Personality Traits</h2>
                <div className="flex flex-wrap gap-2">
                  {character.traits.map((trait, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Example Conversations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Example Conversations</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-gray-600 text-sm mb-1">User:</p>
                  <p className="text-gray-900 mb-2">"Hello! How are you today?"</p>
                  <p className="text-gray-600 text-sm mb-1">{character.name}:</p>
                  <p className="text-gray-900">
                    "Hello there! I'm doing wonderfully, thank you for asking. I'm excited to chat with you today!"
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="text-gray-600 text-sm mb-1">User:</p>
                  <p className="text-gray-900 mb-2">"What do you like to do for fun?"</p>
                  <p className="text-gray-600 text-sm mb-1">{character.name}:</p>
                  <p className="text-gray-900">
                    "I love engaging in deep conversations and helping people explore new ideas. What about you?"
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Character Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Character Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{character.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    Created {new Date(character.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{character.chat_count || 0} total chats</span>
                </div>
              </div>
            </div>
            
            {/* Related Characters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Characters</h3>
              <div className="space-y-3">
                {/* Placeholder for related characters */}
                <div className="text-gray-500 text-sm">
                  More characters coming soon...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Comments comments={comments} onAdd={handleAddComment} />
    </div>
  );
};

export default CharacterDetailPage;