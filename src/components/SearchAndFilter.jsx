import React from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';

const SearchAndFilter = ({ 
  filters,
  onFilterChange
}) => {
  const defaultCategories = [
    'Anime',
    'Literature', 
    'Fantasy',
    'Superhero',
    'Sci-Fi',
    'Historical',
    'Gaming',
    'Movies',
    'TV Shows',
    'Books'
  ];

  const defaultSortOptions = [
    { value: 'chat_count', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'name', label: 'Name A-Z' }
  ];

  const handleSearchChange = (value) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleCategoryChange = (value) => {
    onFilterChange({ ...filters, category: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
      
      {/* Search Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search characters..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10"
          >
            <option value="all">All Categories</option>
            {defaultCategories.map((category) => (
              <option key={category} value={category.toLowerCase()}>
                {category}
              </option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;