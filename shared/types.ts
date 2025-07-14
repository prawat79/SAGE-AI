export interface Character {
  id: string;
  name: string;
  avatar_url?: string;
  description?: string;
  // ...other fields as needed
}

export interface User {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  // ...other fields as needed
}

export interface Collection {
  name: string;
  items: string[];
}