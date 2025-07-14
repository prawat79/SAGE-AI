import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, TrendingUp, Star, Users, MessageCircle, Filter, Grid, List, ArrowRight, Bookmark, Heart, Eye, Key } from 'lucide-react';

const PromptStorePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    sort: 'trending',
    style: 'all',
    gender: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('userApiKey') || '');
  const [apiKeyError, setApiKeyError] = useState('');

  // FlowGPT-style categories
  const categories = [
    { id: 'all', name: 'All', icon: '🌟' },
    { id: 'job-hunting', name: 'Job Hunting', icon: '🏹' },
    { id: 'health-lifestyle', name: 'Health & Lifestyle', icon: '🌱' },
    { id: 'academic', name: 'Academic', icon: '📖' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'programming', name: 'Programming', icon: '🖥️' },
    { id: 'marketing', name: 'Marketing', icon: '📢' },
    { id: 'image-generator', name: 'Image Generator', icon: '🎨' },
    { id: 'prompt-generator', name: 'Prompt Generator', icon: '📄' },
    { id: 'oc', name: 'OC', icon: '🧚‍♂️' },
    { id: 'anime', name: 'Anime', icon: '🍙' },
    { id: 'game', name: 'Game', icon: '👾' },
    { id: 'productivity', name: 'Productivity', icon: '⏳' },
    { id: 'ai-tools', name: 'AI Tools', icon: '🤖' }
  ];

  const styles = [
    { id: 'all', name: 'All style' },
    { id: 'dominant', name: 'Dominant', icon: '👑' },
    { id: 'submissive', name: 'Submissive', icon: '🎀' },
    { id: 'romantic', name: 'Romantic', icon: '🌹' },
    { id: 'drama', name: 'Drama', icon: '🎭' },
    { id: 'cold', name: 'Cold', icon: '❄️' },
    { id: 'proactive', name: 'Proactive', icon: '🚀' },
    { id: 'caring', name: 'Caring & Fluff', icon: '🍪' },
    { id: 'toxic', name: 'Toxic', icon: '🐍' },
    { id: 'fantasy', name: 'Fantasy', icon: '🏰' },
    { id: 'protector', name: 'Protector', icon: '🛡️' },
    { id: 'villain', name: 'Villain', icon: '🦹' },
    { id: 'celebrity', name: 'Celebrity', icon: '🌟' },
    { id: 'classroom', name: 'Classroom', icon: '📚' },
    { id: 'scenario', name: 'Scenario', icon: '🎬' }
  ];

  const genders = [
    { id: 'all', name: 'All gender' },
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' },
    { id: 'non-binary', name: 'Non-binary' },
    { id: 'other', name: 'Other' }
  ];

  const sortOptions = [
    { id: 'trending', name: 'Trending', icon: TrendingUp },
    { id: 'popular', name: 'Popular', icon: Star },
    { id: 'newest', name: 'Newest', icon: ArrowRight },
    { id: 'rating', name: 'Top Rated', icon: Star },
    { id: 'most-saved', name: 'Most Saved', icon: Bookmark }
  ];

  // Supported model providers
  const modelProviders = [
    { id: 'gemini', name: 'Google Gemini' },
    { id: 'openai', name: 'OpenAI (ChatGPT, GPT-4, etc.)' },
    { id: 'anthropic', name: 'Anthropic – Claude' },
    { id: 'grok', name: 'xAI Grok' },
    { id: 'qwen', name: 'Alibaba Qwen' }
  ];

  useEffect(() => {
    fetchPrompts();
  }, [filters]);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.style && filters.style !== 'all') params.append('style', filters.style);
      if (filters.gender && filters.gender !== 'all') params.append('gender', filters.gender);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort) params.append('sort', filters.sort);
      params.append('limit', 24);
      params.append('page', 1);

      const res = await fetch(`/api/characters?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch prompts');
      const data = await res.json();
      setPrompts(data.characters || []);
    } catch (err) {
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Provider state
  const [selectedProvider, setSelectedProvider] = useState(() => localStorage.getItem('userProvider') || 'gemini');

  // Handler for opening the API key modal
  const openApiKeyModal = () => {
    setApiKeyInput(userApiKey || '');
    setApiKeyError('');
    setSelectedProvider(localStorage.getItem('userProvider') || 'gemini');
    setShowApiKeyModal(true);
  };

  // Handler for saving the API key and provider
  const handleSaveApiKey = () => {
    localStorage.setItem('userApiKey', apiKeyInput);
    localStorage.setItem('userProvider', selectedProvider);
    setUserApiKey(apiKeyInput);
    setShowApiKeyModal(false);
    setApiKeyInput('');
    setApiKeyError('');
  };

  // Handler for removing the API key and provider
  const handleRemoveApiKey = () => {
    localStorage.removeItem('userApiKey');
    localStorage.removeItem('userProvider');
    setUserApiKey('');
    setApiKeyInput('');
    setShowApiKeyModal(false);
    setApiKeyError('');
    setSelectedProvider('gemini');
  };

  // Handler for Try Prompt button
  const handleTryPrompt = (promptId) => {
    if (!userApiKey) {
      setApiKeyError('Please enter your AI API key to use chat features.');
      openApiKeyModal();
      return;
    }
    navigate(`/prompt/${promptId}`);
  };

  // Toggle show/hide for API key input
  const [showApiKey, setShowApiKey] = useState(false);

  const PromptCard = ({ prompt }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="text-white text-2xl font-bold">
            {categories.find(c => c.id === prompt.category)?.icon || '🤖'}
          </div>
        </div>
        {prompt.trending && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Trending
            </span>
          </div>
        )}
        {prompt.featured && (
          <div className="absolute top-2 right-2">
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
              ⭐ Featured
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">{prompt.title || prompt.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{prompt.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {(prompt.tags && prompt.tags.length > 0 ? prompt.tags : []).slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{(prompt.interactions || prompt.chat_count || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{prompt.rating || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              <span>{prompt.saves || 0}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={prompt.avatar || prompt.avatar_url || '/api/placeholder/40/40'}
              alt={prompt.author || prompt.created_by || 'Author'}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600">{prompt.author || prompt.created_by || 'Unknown'}</span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Heart className="h-4 w-4 text-gray-400 hover:text-red-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bookmark className="h-4 w-4 text-gray-400 hover:text-blue-500" />
            </button>
          </div>
        </div>
        <Link
          to="#"
          onClick={e => {
            e.preventDefault();
            handleTryPrompt(prompt.id);
          }}
          className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center mt-3"
        >
          Try Prompt
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating API Key Button */}
      <button
        className="fixed right-6 bottom-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
        title="Enter your AI API Key"
        onClick={openApiKeyModal}
      >
        <Key className="h-6 w-6" />
      </button>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => { setShowApiKeyModal(false); setApiKeyError(''); }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Key className="h-5 w-5" /> Enter Your AI API Key
            </h2>
            {apiKeyError && <div className="mb-3 text-red-600 text-sm">{apiKeyError}</div>}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Provider</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedProvider}
                onChange={e => setSelectedProvider(e.target.value)}
              >
                {modelProviders.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="relative mb-4">
              <input
                type={showApiKey ? 'text' : 'password'}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={selectedProvider === 'gemini' ? 'AIza...' : selectedProvider === 'openai' ? 'sk-...' : 'Enter your API key'}
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowApiKey(v => !v)}
                tabIndex={-1}
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            {userApiKey && (
              <div className="mb-3 text-xs text-gray-500">
                <span className="font-semibold">Current key:</span> <span className="font-mono">{'*'.repeat(userApiKey.length > 6 ? 6 : userApiKey.length)}{userApiKey.length > 6 ? '...' : ''}</span>
                <span className="ml-2">({modelProviders.find(p => p.id === (localStorage.getItem('userProvider') || 'gemini'))?.name})</span>
              </div>
            )}
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold mb-2"
              onClick={handleSaveApiKey}
              disabled={!apiKeyInput}
            >
              Save API Key
            </button>
            {userApiKey && (
              <button
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                onClick={handleRemoveApiKey}
              >
                Remove API Key
              </button>
            )}
            <p className="text-xs text-gray-500 mt-3">
              Your API key is stored only in your browser and never sent to our server.<br/>
              Get your Gemini API key from{' '}
              <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Google AI Studio
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Find & Use The Best Prompts
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover trending AI prompts and characters from our community. Boost your productivity and creativity.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 space-x-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleFilterChange('category', category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  filters.category === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4">
            {/* Style Filter */}
            <select
              value={filters.style}
              onChange={(e) => handleFilterChange('style', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {styles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.icon ? `${style.icon} ${style.name}` : style.name}
                </option>
              ))}
            </select>
            
            {/* Gender Filter */}
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {genders.map((gender) => (
                <option key={gender.id} value={gender.id}>
                  {gender.name}
                </option>
              ))}
            </select>
            
            {/* Sort Filter */}
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-3"></div>
                  <div className="flex gap-1 mb-3">
                    <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                    <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : prompts.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No prompts found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptStorePage;