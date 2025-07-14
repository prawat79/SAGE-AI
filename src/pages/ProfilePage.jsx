import MainLayout from "@/layout/MainLayout";
import { Card } from "@/components/ui/card";
import Collections from "@/components/Collections";
import PromptCard from "@/components/PromptCard";
import { useState } from "react";

export default function ProfilePage() {
  // Assume user and userCharacters are fetched from context or API
  const user = {};
  const userCharacters = [];
  // ...fetch logic here...
  const [collections, setCollections] = useState([
    { name: "Favorites", items: [] },
    { name: "Funny Bots", items: [] },
  ]);
  const handleCreateCollection = (name) => {
    setCollections((prev) => [...prev, { name, items: [] }]);
  };
  const handleSelectCollection = (col) => {
    // Optionally show collection details or items
    alert(`Selected collection: ${col.name}`);
  };
  const handleAddToCollection = (collectionName, promptId) => {
    setCollections((prev) =>
      prev.map((col) =>
        col.name === collectionName && !col.items.includes(promptId)
          ? { ...col, items: [...col.items, promptId] }
          : col
      )
    );
  };
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center gap-6 mb-8">
          <img src={user.avatar_url || "/default-avatar.png"} alt={user.name} className="w-20 h-20 rounded-full border-4 border-blue-500" />
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-zinc-500 dark:text-zinc-400">{user.bio}</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4">My Characters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {userCharacters.map((character) => (
            <PromptCard
              key={character.id}
              prompt={character}
              collections={collections}
              onAddToCollection={handleAddToCollection}
            />
          ))}
        </div>
        <Collections collections={collections} onCreate={handleCreateCollection} onSelect={handleSelectCollection} />
      </div>
    </MainLayout>
  );
}