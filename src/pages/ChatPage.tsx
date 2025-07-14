import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, MoreVertical, Trash2, RefreshCw, User, Bot, ArrowLeft, Key, Sparkles, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CharacterService } from '../services/characterService';
import ConversationService from '../services/conversationService';
import AIService from '../services/aiService';
import MainLayout from "@/layout/MainLayout";
import ChatBubble from "@/components/ChatBubble";

const Message = ({ message, character, onRegenerate, onCopy }) => {
  const isUser = message.sender_type === 'user';
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopy) onCopy();
  };

  return (
    <div className={`flex items-start space-x-4 mb-8 group ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        ) : (
          <img
            src={character?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character?.name}`}
            alt={character?.name || 'AI'}
            className="w-10 h-10 rounded-full border-2 border-purple-500/30"
          />
        )}
      </div>
      
      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-4 rounded-2xl ${
          isUser 
            ? 'bg-gradient-to-br from-purple-500 to-cyan-500 text-white' 
            : 'glass text-white'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* Message Actions */}
        <div className={`flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <button
            onClick={handleCopy}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Copy message"
          >
            {copied ? (
              <span className="text-xs text-green-400">Copied!</span>
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
          
          {!isUser && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Regenerate response"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          )}
          
          <span className="text-xs text-gray-500">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
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
      
      const conversationData = await ConversationService.getConversation(conversationId, user?.access_token);
      if (conversationData) {
        setConversation(conversationData);
        
        const characterData = await CharacterService.getCharacterById(conversationData.character_id);
        setCharacter(characterData);
        
        const messagesData = await ConversationService.getMessages(conversationId, user?.access_token);
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
      const userMessage = {
        id: `temp_${Date.now()}`,
        content: messageContent,
        sender_type: 'user',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      const savedUserMessage = await ConversationService.saveMessage(
        conversationId,
        messageContent,
        'user',
        user?.access_token
      );

      const aiResponse = await AIService.generateResponse(
        [{ content: messageContent, sender_type: 'user' }],
        character,
        {},
        userApiKey
      );

      const savedAiMessage = await ConversationService.saveMessage(
        conversationId,
        aiResponse,
        'ai',
        user?.access_token
      );

      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== userMessage.id);
        return [...filtered, savedUserMessage, savedAiMessage];
      });
    } catch (err) {
      console.error('Error sending message:', err);
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
      await ConversationService.clearConversation(conversationId, user?.access_token);
      setMessages([]);
      setShowMenu(false);
    } catch (err) {
      console.error('Error clearing conversation:', err);
    }
  };

  const deleteConversation = async () => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      await ConversationService.deleteConversation(conversationId, user?.access_token);
      navigate('/explore');
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to chat</h2>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary px-6 py-3 rounded-xl font-semibold"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (!conversationId || conversationId === 'new') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">No Chat Selected</h2>
          <p className="text-gray-400 mb-6">Choose a character from the explore page to start chatting.</p>
          <button
            onClick={() => navigate('/explore')}
            className="btn-primary px-6 py-3 rounded-xl font-semibold"
          >
            Explore Characters
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
          <button
            onClick={loadConversation}
            className="btn-primary px-6 py-3 rounded-xl font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Enter Your Gemini API Key</h2>
              <p className="text-gray-400 text-sm">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>
            
            <input
              type="password"
              className="w-full input-glass rounded-xl px-4 py-4 mb-6 text-white placeholder-gray-400 focus-ring"
              placeholder="AIza..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              autoFocus
            />
            
            <div className="flex gap-3">
              <button
                className="flex-1 btn-primary py-3 rounded-xl font-semibold"
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput}
              >
                Save API Key
              </button>
              <button
                className="flex-1 btn-secondary py-3 rounded-xl font-semibold"
                onClick={() => setShowApiKeyModal(false)}
              >
                Cancel
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              Get your API key from{' '}
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-purple-400 hover:text-purple-300"
              >
                Google AI Studio
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/explore')}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          
          {character && (
            <>
              <div className="relative">
                <img
                  src={character.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name}`}
                  alt={character.name}
                  className="w-12 h-12 rounded-full border-2 border-purple-500/30"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              
              <div>
                <h2 className="font-bold text-white text-lg">{character.name}</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                    {character.category}
                  </span>
                  <span className="text-xs text-green-400">● Online</span>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 glass rounded-xl border border-white/10 py-2 z-50 animate-scale-in">
              <button
                onClick={clearConversation}
                className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Clear Conversation</span>
              </button>
              <button
                onClick={deleteConversation}
                className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Conversation</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Start a conversation with {character?.name}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {character?.greeting_message || "Say hello or ask a question to begin chatting!"}
              </p>
              
              {/* Suggested prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  "Hello! How are you today?",
                  "Tell me about yourself",
                  "What do you like to talk about?",
                  "What's your favorite topic?"
                ].map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setNewMessage(prompt)}
                    className="p-3 glass rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <ChatBubble key={idx} message={msg} isUser={msg.sender_type === 'user'} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="glass border-t border-white/10 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${character?.name || 'AI'}...`}
                className="w-full input-glass rounded-2xl px-6 py-4 text-white placeholder-gray-400 resize-none focus-ring"
                rows={1}
                style={{ minHeight: '56px', maxHeight: '120px' }}
                disabled={sending}
              />
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="btn-primary p-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
            >
              {sending ? (
                <div className="w-5 h-5 spinner"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
          
          {!userApiKey && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Enter your Gemini API key to start chatting
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}