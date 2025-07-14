import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Star, User, Calendar, Bookmark } from 'lucide-react';
import { Button } from "@/components/ui/button";

const CharacterCard = ({ character, onStartChat }) => {
  const {
    id,
    name,
    description,
    category,
    personality,
    chat_count,
    rating,
    tags,
    created_at,
    avatar_url
  } = character;

  const handleStartChat = (e) => {
    e.preventDefault();
    if (onStartChat) {
      onStartChat(character);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Header with Avatar */}
      <div className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex-shrink-0">
            <img
              src={avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
              alt={name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                {category}
              </span>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{rating || 4.5}</span>
              </div>
            </div>
            
            <Link to={`/character/${id}`} className="block">
              <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors group-hover:text-blue-600">
                {name}
              </h3>
            </Link>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>
        
        {personality && (
          <p className="text-gray-500 text-xs mb-4 italic">
            Personality: {personality}
          </p>
        )}
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Chat Button */}
        <button
          onClick={handleStartChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Start Chat
        </button>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{chat_count || 0} chats</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 absolute top-4 right-4">
        <Button size="icon" variant="ghost" className="hover:text-red-500 transition-colors">
          <Heart className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="ghost" className="hover:text-yellow-500 transition-colors">
          <Bookmark className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

// Keep backward compatibility
const PromptCard = CharacterCard;

export default CharacterCard;
export { PromptCard };