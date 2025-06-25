import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, MoreVertical, Trash2, RefreshCw, User, Bot, ArrowLeft, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CharacterService } from '../services/characterService';
import ConversationService from '../services/conversationService';
import AIService from '../services/aiService';

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
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('userApiKey') || '');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (conversationId && conversationId !== 'new') {
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
      const conversationData = await ConversationService.getConversation(conversationId);
      if (conversationData) {
        setConversation(conversationData);
        
        // Load character details
        const characterData = await CharacterService.getCharacterById(conversationData.character_id);
        setCharacter(characterData);
        
        // Load messages
        const messagesData = await ConversationService.getMessages(conversationId);
        setMessages(messagesData || []);
      } else {
        setError('Conversation not found');
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
    if (!newMessage.trim() || sending) return;

    if (!userApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Add user message to UI immediately
      const userMessage = {
        id: `temp_${Date.now()}`,
        content: messageContent,
        sender_type: 'user',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      // Save user message
      const savedUserMessage = await ConversationService.saveMessage(
        conversationId,
        messageContent,
        'user'
      );

      // Generate AI response
      const aiResponse = await AIService.generateResponse(
        [{ content: messageContent, sender_type: 'user' }],
        character,
        {},
        userApiKey
      );

      // Save AI message
      const savedAiMessage = await ConversationService.saveMessage(
        conversationId,
        aiResponse,
        'ai'
      );

      // Update messages with saved versions
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== userMessage.id);
        return [...filtered, savedUserMessage, savedAiMessage];
      });

      // Update conversation timestamp
      await ConversationService.updateConversationTimestamp(conversationId);
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      setError('Failed to send message. Please check your API key.');
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

  const handleSaveApiKey = () => {
    localStorage.setItem('userApiKey', apiKeyInput);
    setUserApiKey(apiKeyInput);
    setShowApiKeyModal(false);
    setApiKeyInput('');
  };

  const clearConversation = async () => {
    if (!window.confirm('Are you sure you want to clear this conversation?')) return;
    
    try {
      await ConversationService.clearConversation(conversationId);
      setMessages([]);
      setShowMenu(false);
    } catch (err) {
      console.error('Error clearing conversation:', err);
    }
  };

  const deleteConversation = async () => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      await ConversationService.deleteConversation(conversationId);
      navigate('/explore');
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

  if (!conversationId || conversationId === 'new') {
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
      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Key className="h-5 w-5" /> Enter Your OpenAI API Key
            </h2>
            <p className="text-gray-600 mb-4">
              To use the chat feature, please enter your OpenAI API key. Your key is stored locally and never sent to our servers.
            </p>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="sk-..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput}
              >
                Save API Key
              </button>
              <button
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setShowApiKeyModal(false)}
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>
            </p>
          </div>
        </div>
      )}

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
          {!userApiKey && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="text-blue-600 hover:underline"
              >
                Enter your OpenAI API key
              </button>
              {' '}to start chatting
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;