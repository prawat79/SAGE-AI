import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  // Sample conversation history
  const conversations = [
    { id: 1, title: 'Chat about React development', date: '2 hours ago' },
    { id: 2, title: 'Help with JavaScript algorithms', date: 'Yesterday' },
    { id: 3, title: 'CSS styling assistance', date: '3 days ago' },
    { id: 4, title: 'Project architecture discussion', date: 'Last week' },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      {/* Close button (mobile only) */}
      <button 
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Sidebar header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Conversations</h2>
      </div>

      {/* New chat button */}
      <div className="p-4">
        <Link 
          to="/chat/new" 
          className="flex items-center justify-center w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Chat
        </Link>
      </div>

      {/* Conversation history */}
      <div className="p-4">
        <h3 className="text-sm uppercase text-gray-400 mb-2">Recent Conversations</h3>
        <ul className="space-y-2">
          {conversations.map((convo) => (
            <li key={convo.id}>
              <Link 
                to={`/chat/${convo.id}`} 
                className="block p-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <div className="text-sm font-medium truncate">{convo.title}</div>
                <div className="text-xs text-gray-400">{convo.date}</div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Sidebar footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
            <span className="font-bold">U</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">User</div>
            <div className="text-xs text-gray-400">Free Plan</div>
          </div>
          <Link to="/settings" className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
