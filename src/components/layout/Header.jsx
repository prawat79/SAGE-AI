import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-dark-300 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/favicon.svg" alt="AI Flow Logo" className="w-8 h-8" />
          <span className="text-xl font-bold bg-gradient-to-r from-secondary-500 to-accent-400 text-transparent bg-clip-text">AI Flow</span>
        </Link>

        {/* Search Bar (Desktop) */}
        <div className={`hidden md:flex items-center ${isSearchOpen ? 'w-1/2' : 'w-auto'} transition-all duration-300`}>
          {isSearchOpen && (
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search prompts, bounties, and more..." 
                className="w-full bg-dark-100 border border-dark-100 focus:border-secondary-500 rounded-full py-2 px-4 text-sm focus:outline-none"
              />
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setIsSearchOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {!isSearchOpen && (
            <button 
              className="text-gray-400 hover:text-white p-2"
              onClick={() => setIsSearchOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-secondary-400 transition-colors">Home</Link>
          <Link to="/prompts" className="hover:text-secondary-400 transition-colors">Prompts</Link>
          <Link to="/bounties" className="hover:text-secondary-400 transition-colors">Bounties</Link>
          <Link to="/community" className="hover:text-secondary-400 transition-colors">Community</Link>
        </nav>

        {/* Auth Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login" className="hover:text-secondary-400 transition-colors">Login</Link>
          <Link to="/register" className="bg-accent-500 hover:bg-accent-600 text-dark-500 font-medium px-4 py-2 rounded-md transition-colors">
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu and Search Buttons */}
        <div className="flex md:hidden items-center space-x-2">
          <button 
            className="text-gray-400 hover:text-white p-2"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button 
            className="text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden px-4 py-2 bg-dark-200">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search prompts, bounties, and more..." 
              className="w-full bg-dark-100 border border-dark-100 focus:border-secondary-500 rounded-full py-2 px-4 text-sm focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-200 px-4 py-2">
          <nav className="flex flex-col space-y-3 py-3">
            <Link to="/" className="hover:text-secondary-400 transition-colors">Home</Link>
            <Link to="/prompts" className="hover:text-secondary-400 transition-colors">Prompts</Link>
            <Link to="/bounties" className="hover:text-secondary-400 transition-colors">Bounties</Link>
            <Link to="/community" className="hover:text-secondary-400 transition-colors">Community</Link>
          </nav>
          <div className="flex flex-col space-y-3 py-3 border-t border-dark-100">
            <Link to="/login" className="hover:text-secondary-400 transition-colors">Login</Link>
            <Link to="/register" className="bg-accent-500 hover:bg-accent-600 text-dark-500 font-medium px-4 py-2 rounded-md transition-colors text-center">
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
