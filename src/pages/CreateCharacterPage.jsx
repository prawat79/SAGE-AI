import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CharacterService } from '../services/characterService';
import { Upload, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import MainLayout from "@/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CreateCharacterPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personality: '',
    scenario: '',
    greeting_message: '',
    category: 'general',
    tags: [],
    avatar_url: '',
    is_public: true
  });
  const [tagInput, setTagInput] = useState('');

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'anime', label: 'Anime' },
    { value: 'game', label: 'Game' },
    { value: 'celebrity', label: 'Celebrity' },
    { value: 'fictional', label: 'Fictional' },
    { value: 'historical', label: 'Historical' },
    { value: 'assistant', label: 'Assistant' },
    { value: 'roleplay', label: 'Roleplay' },
    { value: 'educational', label: 'Educational' },
    { value: 'entertainment', label: 'Entertainment' }
  ];

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const characterData = {
        ...formData,
        created_by: user.id
      };
      
      const newCharacter = await CharacterService.createCharacter(characterData, user.access_token);
      navigate(`/character/${newCharacter.id}`);
    } catch (error) {
      console.error('Error creating character:', error);
      alert('Failed to create character. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const CharacterPreview = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4 mb-4">
        {formData.avatar_url ? (
          <img 
            src={formData.avatar_url} 
            alt={formData.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-2xl">{formData.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-gray-900">{formData.name || 'Character Name'}</h3>
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {categories.find(cat => cat.value === formData.category)?.label || 'General'}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4">{formData.description || 'Character description will appear here...'}</p>
      
      {formData.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {formData.tags.map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {formData.greeting_message && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-blue-800 italic">"{formData.greeting_message}"</p>
        </div>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto py-8">
        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-6">Create a New AI Character</h1>
          <form className="flex flex-col gap-4">
            <Input placeholder="Character Name" /* value, onChange, etc. */ />
            <Textarea placeholder="Description" rows={4} /* value, onChange, etc. */ />
            <Input placeholder="Avatar URL (optional)" /* value, onChange, etc. */ />
            {/* Add more fields as needed */}
            <Button type="submit" className="mt-4">Create Character</Button>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}