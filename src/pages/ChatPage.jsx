import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, MoreVertical, Trash2, RefreshCw, User, Bot, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AIService } from '../services/aiService';

const Message = ({ message, character }) => {
  const isUser = message.sender_type === 'user';
  
  return (
    <div className={`flex items-start space-x-3 mb-6 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        ) : (
          <img
            src={character?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character?.name}`}
            alt={character?.name || 'AI'}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
      </div>
      <div className={`flex-1 max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
        isUser ? 'text-right' : 'text-left'
      }`}>
        <div className={`inline-block p-3 rounded-lg ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-sm' 
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(message.created_at).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [character, setCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [userApiKey] = useState(() => localStorage.getItem('userApiKey') || '');

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      setLoading(true);
      
      // Load conversation details
      const conversationResponse = await fetch(`/api/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      });
      
      if (!conversationResponse.ok) {
        throw new Error('Failed to load conversation');
      }
      
      const conversationData = await conversationResponse.json();
      setConversation(conversationData);
      
      // Load character details
      const characterResponse = await fetch(`/api/characters/${conversationData.character_id}`);
      if (characterResponse.ok) {
        const characterData = await characterResponse.json();
        setCharacter(characterData);
      }
      
      // Load messages
      const messagesResponse = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      });
      
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.data || []);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !conversationId) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Add user message to UI immediately
      const userMessage = {
        id: Date.now(),
        content: messageContent,
        sender_type: 'user',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      // Send message to backend or AIService
      // If you want to call AIService directly from frontend:
      // const aiResponse = await AIService.generateResponse([...messages, userMessage], character, {}, userApiKey);
      // setMessages(prev => [...prev, { id: Date.now() + 1, content: aiResponse, sender_type: 'ai', created_at: new Date().toISOString() }]);

      // If using backend, send the API key as a custom header
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
          'X-OpenAI-Key': userApiKey // Custom header for backend to use
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: messageContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      
      // Update messages with the actual saved message and AI response
      if (result.userMessage && result.aiResponse) {
        setMessages(prev => {
          // Remove the temporary user message and add the real ones
          const filtered = prev.filter(msg => msg.id !== userMessage.id);
          return [...filtered, result.userMessage, result.aiResponse];
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const clearConversation = async () => {
    if (!window.confirm('Are you sure you want to clear this conversation?')) return;
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      });
      
      if (response.ok) {
        setMessages([]);
        setShowMenu(false);
      }
    } catch (err) {
      console.error('Error clearing conversation:', err);
    }
  };

  const deleteConversation = async () => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      });
      
      if (response.ok) {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to chat</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Chat Selected</h2>
          <p className="text-gray-600 mb-6">Choose a character from the explore page to start chatting.</p>
          <button
            onClick={() => navigate('/explore')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Explore Characters
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadConversation}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/explore')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          {character && (
            <>
              <img
                src={character.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name}`}
                alt={character.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold text-gray-900">{character.name}</h2>
                <p className="text-sm text-gray-500">{character.category}</p>
              </div>
            </>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={clearConversation}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Clear Conversation</span>
              </button>
              <button
                onClick={deleteConversation}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Conversation</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start a conversation with {character?.name}
              </h3>
              <p className="text-gray-600">
                Say hello or ask a question to begin chatting!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                character={character}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${character?.name || 'AI'}...`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
                disabled={sending}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;