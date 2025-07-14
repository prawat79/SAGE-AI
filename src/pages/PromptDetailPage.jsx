import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Comments from "@/components/Comments";

const PromptDetailPage = () => {
  const { promptId } = useParams();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const handleAddComment = (text) => {
    setComments((prev) => [...prev, { user: "Anonymous", text }]);
  };

  useEffect(() => {
    const fetchPrompt = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/characters/${promptId}`);
        if (!res.ok) throw new Error('Prompt not found');
        const data = await res.json();
        setPrompt(data.character || null);
      } catch (err) {
        setPrompt(null);
        setError('Prompt not found.');
      } finally {
        setLoading(false);
      }
    };
    if (promptId) fetchPrompt();
  }, [promptId]);

  if (loading) return <div className="text-center text-xl text-gray-400 py-10">Loading...</div>;
  if (error || !prompt) return <div className="text-center text-xl text-gray-400 py-10">Prompt not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-dark-400 shadow-xl rounded-lg p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary-300 mb-4">{prompt.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-secondary-700 text-secondary-100 text-sm font-semibold px-3 py-1 rounded-full">
            {prompt.category}
          </span>
          {prompt.tags && prompt.tags.map((tag, index) => (
            <span key={index} className="bg-dark-300 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
        
        <p className="text-gray-300 mb-6 text-lg leading-relaxed">{prompt.description}</p>
        
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-accent-300 mb-3">Full Prompt:</h2>
          <div className="bg-dark-300 p-4 rounded-md text-gray-200 whitespace-pre-wrap font-mono text-sm">
            {prompt.fullPrompt}
          </div>
        </div>

        {prompt.exampleUsage && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-accent-300 mb-3">Example Usage:</h2>
            <div className="bg-dark-300 p-4 rounded-md text-gray-200 whitespace-pre-wrap font-mono text-sm">
              {prompt.exampleUsage}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-dark-300">
          <span>By: <span className="text-accent-400 font-medium">{prompt.author}</span></span>
          <span>{prompt.interactions} interactions</span>
        </div>

        {/* Placeholder for action buttons like 'Use this prompt' or 'Chat with this character' */}
        <div className="mt-8 text-center">
          <button className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            Use This Prompt
          </button>
        </div>
        <Comments comments={comments} onAdd={handleAddComment} />
      </div>
    </div>
  );
};

export default PromptDetailPage;