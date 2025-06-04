import React from 'react';
import { useParams } from 'react-router-dom';

// Placeholder data - in a real app, you'd fetch this based on ID
const samplePrompts = [
  {
    id: '1',
    title: 'Creative Story Writing Assistant',
    description: 'Generate compelling plot ideas, character backstories, and dialogue for your next masterpiece. Perfect for novelists and screenwriters. This prompt helps you overcome writer\'s block and explore new narrative avenues. It can suggest twists, character arcs, and setting details to enrich your story.',
    category: 'Writing',
    tags: ['storytelling', 'creative writing', 'fiction', 'narrative', 'plot development'],
    author: 'AI Enthusiast',
    interactions: 1250,
    fullPrompt: 'Imagine you are an AI assistant specialized in creative writing. A user is stuck on their novel about a detective in a futuristic city. Provide three distinct plot twists, two complex secondary characters with hidden motives, and a unique piece of technology that could be central to the mystery.',
    exampleUsage: 'User: I need help with my sci-fi detective novel!\nAI: Okay, for plot twists: 1. The lead detective is a clone of the original, who died years ago. 2. The \'victim\' faked their death to expose a city-wide conspiracy. 3. The central AI governing the city is the true antagonist, subtly manipulating events...'
  },
  {
    id: '2',
    title: 'Code Debugging Helper',
    description: 'Describe your coding problem and get suggestions for debugging. Supports Python, JavaScript, and Java. Helps identify common errors and suggests logical steps to isolate the bug.',
    category: 'Programming',
    tags: ['debugging', 'coding', 'development', 'problem solving', 'software engineering'],
    author: 'DevGuru',
    interactions: 980,
    fullPrompt: 'You are an expert code debugger. A user presents a Python function that is not returning the expected output. Guide them through the debugging process. Ask for the code, expected output, and actual output. Suggest print statements, and explain common pitfalls related to their problem description.',
    exampleUsage: 'User: My Python sorting function isn\'t working.\nAI: Understood. Can you please share the function code, an example input, what you expect as output, and what you are actually getting? Let\'s start by adding some print statements to check the state of your list at different stages...'
  },
  // Add other prompts if needed, matching IDs from HomePage
];

const PromptDetailPage = () => {
  const { promptId } = useParams();
  const prompt = samplePrompts.find(p => p.id === promptId);

  if (!prompt) {
    return <div className="text-center text-xl text-gray-400 py-10">Prompt not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-dark-400 shadow-xl rounded-lg p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary-300 mb-4">{prompt.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-secondary-700 text-secondary-100 text-sm font-semibold px-3 py-1 rounded-full">
            {prompt.category}
          </span>
          {prompt.tags.map((tag, index) => (
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
      </div>
    </div>
  );
};

export default PromptDetailPage;