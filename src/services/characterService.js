const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class CharacterService {
  static async getCharacters(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }

      const response = await fetch(`${API_BASE_URL}/characters?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data: data || this.getFallbackCharacters() };
    } catch (error) {
      console.error('Error fetching characters:', error);
      return { data: this.getFallbackCharacters() };
    }
  }

  static async getCharacterById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/characters/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return this.getFallbackCharacters().find(char => char.id === id);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching character:', error);
      return this.getFallbackCharacters().find(char => char.id === id);
    }
  }

  static async createCharacter(characterData, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(characterData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  }

  static getFallbackCharacters() {
    return [
      {
        id: '1',
        name: 'Sakura Haruno',
        description: 'A skilled medical ninja from the Hidden Leaf Village with pink hair and green eyes.',
        personality: 'Determined, caring, and strong-willed. She can be fierce in battle but gentle when healing.',
        category: 'Anime',
        tags: ['caring', 'energetic', 'ninja'],
        avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
        chat_count: 1250,
        rating: 4.8,
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Asuka Langley',
        description: 'A fiery red-haired pilot of Evangelion Unit-02 with a complex personality.',
        personality: 'Confident, competitive, and prideful. She hides her vulnerabilities behind a strong exterior.',
        category: 'Anime',
        tags: ['dominant', 'tsundere', 'pilot'],
        avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
        chat_count: 980,
        rating: 4.6,
        created_at: '2024-01-10T14:30:00Z'
      },
      {
        id: '3',
        name: 'Princess Zelda',
        description: 'The wise and courageous Princess of Hyrule with magical powers.',
        personality: 'Wise, brave, and compassionate. She carries the weight of her kingdom with grace.',
        category: 'Game',
        tags: ['caring', 'mysterious', 'royal'],
        avatar_url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
        chat_count: 1500,
        rating: 4.9,
        created_at: '2024-01-05T09:15:00Z'
      },
      {
        id: '4',
        name: 'Hermione Granger',
        description: 'A brilliant witch and loyal friend, known for her vast knowledge and quick thinking.',
        personality: 'Intelligent, logical, and fiercely loyal. She values knowledge and justice above all.',
        category: 'Fictional',
        tags: ['intelligent', 'loyal', 'witch'],
        avatar_url: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
        chat_count: 2100,
        rating: 4.7,
        created_at: '2024-01-01T16:20:00Z'
      },
      {
        id: '5',
        name: 'Yuki Nagato',
        description: 'A quiet and mysterious alien interface with incredible powers.',
        personality: 'Stoic, observant, and rarely shows emotion. She speaks in a monotone voice.',
        category: 'Anime',
        tags: ['cold', 'mysterious', 'alien'],
        avatar_url: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400',
        chat_count: 750,
        rating: 4.5,
        created_at: '2023-12-28T11:45:00Z'
      },
      {
        id: '6',
        name: 'Tifa Lockhart',
        description: 'A martial artist and bar owner with a kind heart and incredible strength.',
        personality: 'Caring, strong, and supportive. She is always there for her friends.',
        category: 'Game',
        tags: ['caring', 'friendly', 'fighter'],
        avatar_url: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400',
        chat_count: 1800,
        rating: 4.8,
        created_at: '2023-12-20T13:00:00Z'
      }
    ];
  }
}

export default CharacterService;