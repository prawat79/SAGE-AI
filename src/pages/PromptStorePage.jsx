import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, TrendingUp, Star, Users, MessageCircle, Filter, Grid, List, ArrowRight, Bookmark, Heart, Eye } from 'lucide-react';

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

  // Sample prompts data (in real app, fetch from API)
  const samplePrompts = [
    {
      id: '1',
      title: 'Creative Writing Assistant',
      description: 'Generate compelling stories, characters, and plot ideas for your creative writing projects.',
      category: 'academic',
      style: 'proactive',
      gender: 'all',
      author: 'AI Writer',
      avatar: '/api/placeholder/40/40',
      interactions: 15420,
      rating: 4.8,
      saves: 2341,
      tags: ['writing', 'creativity', 'storytelling'],
      trending: true,
      featured: true
    },
    {
      id: '2',
      title: 'Code Debugging Expert',
      description: 'Debug your code efficiently with step-by-step guidance and best practices.',
      category: 'programming',
      style: 'proactive',
      gender: 'all',
      author: 'DevMaster',
      avatar: '/api/placeholder/40/40',
      interactions: 8932,
      rating: 4.9,
      saves: 1876,
      tags: ['coding', 'debugging', 'programming'],
      trending: true
    },
    {
      id: '3',
      title: 'Marketing Campaign Strategist',
      description: 'Create effective marketing campaigns and strategies for your business.',
      category: 'marketing',
      style: 'proactive',
      gender: 'all',
      author: 'MarketPro',
      avatar: '/api/placeholder/40/40',
      interactions: 12567,
      rating: 4.7,
      saves: 3421,
      tags: ['marketing', 'strategy', 'business'],
      trending: false
    },
    {
      id: '4',
      title: 'Anime Character Creator',
      description: 'Design unique anime characters with detailed backstories and personalities.',
      category: 'anime',
      style: 'romantic',
      gender: 'female',
      author: 'AnimeArt',
      avatar: '/api/placeholder/40/40',
      interactions: 23451,
      rating: 4.6,
      saves: 5432,
      tags: ['anime', 'character', 'creative'],
      trending: true,
      featured: true
    },
    {
      id: '5',
      title: 'Job Interview Coach',
      description: 'Practice job interviews and get personalized feedback to land your dream job.',
      category: 'job-hunting',
      style: 'caring',
      gender: 'all',
      author: 'CareerCoach',
      avatar: '/api/placeholder/40/40',
      interactions: 9876,
      rating: 4.8,
      saves: 2109,
      tags: ['career', 'interview', 'job'],
      trending: false
    },
    {
      id: '6',
      title: 'Fantasy World Builder',
      description: 'Create immersive fantasy worlds with rich lore, characters, and storylines.',
      category: 'game',
      style: 'fantasy',
      gender: 'all',
      author: 'WorldCrafter',
      avatar: '/api/placeholder/40/40',
      interactions: 18765,
      rating: 4.9,
      saves: 4321,
      tags: ['fantasy', 'worldbuilding', 'rpg'],
      trending: true
    }
  ];

  useEffect(() => {
    fetchPrompts();
  }, [filters]);

  const fetchPrompts = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let filteredPrompts = [...samplePrompts];
      
      // Apply filters
      if (filters.category !== 'all') {
        filteredPrompts = filteredPrompts.filter(p => p.category === filters.category);
      }
      
      if (filters.style !== 'all') {
        filteredPrompts = filteredPrompts.filter(p => p.style === filters.style);
      }
      
      if (filters.gender !== 'all') {
        filteredPrompts = filteredPrompts.filter(p => p.gender === filters.gender || p.gender === 'all');
      }
      
      if (filters.search) {
        filteredPrompts = filteredPrompts.filter(p => 
          p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
        );
      }
      
      // Apply sorting
      switch (filters.sort) {
        case 'trending':
          filteredPrompts.sort((a, b) => b.trending - a.trending || b.interactions - a.interactions);
          break;
        case 'popular':
          filteredPrompts.sort((a, b) => b.interactions - a.interactions);
          break;
        case 'newest':
          // In real app, sort by created_at
          break;
        case 'rating':
          filteredPrompts.sort((a, b) => b.rating - a.rating);
          break;
        case 'most-saved':
          filteredPrompts.sort((a, b) => b.saves - a.saves);
          break;
      }
      
      setPrompts(filteredPrompts);
      setLoading(false);
    }, 500);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">{prompt.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{prompt.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {prompt.tags.slice(0, 3).map((tag, index) => (
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
              <span>{prompt.interactions.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{prompt.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              <span>{prompt.saves}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={prompt.avatar}
              alt={prompt.author}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600">{prompt.author}</span>
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
          to={`/prompt/${prompt.id}`}
          className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center mt-3"
        >
          Try Prompt
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
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