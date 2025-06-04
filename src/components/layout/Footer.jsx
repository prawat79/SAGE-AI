import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 py-6 text-center">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} FlowGPT Clone. All rights reserved.</p>
        <p className="text-sm mt-1">
          Inspired by <a href="https://flowgpt.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">FlowGPT.com</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;