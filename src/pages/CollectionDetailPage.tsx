import { useParams } from "react-router-dom";
import PromptCard from "@/components/PromptCard";
import { useState, useEffect } from "react";
import MainLayout from "@/layout/MainLayout";

export default function CollectionDetailPage() {
  const { name } = useParams();
  // Simulate fetching collection by name (replace with real API in production)
  const [collection, setCollection] = useState(null);
  const [userCharacters, setUserCharacters] = useState([]); // Replace with real fetch

  useEffect(() => {
    // Simulate fetch: in real app, fetch collection and items from backend
    const storedCollections = JSON.parse(localStorage.getItem("collections") || "[]");
    const found = storedCollections.find((col) => col.name === name);
    setCollection(found || { name, items: [] });
    // Simulate fetch for items (replace with real fetch)
    setUserCharacters(JSON.parse(localStorage.getItem("userCharacters") || "[]"));
  }, [name]);

  if (!collection) return <div>Loading...</div>;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Collection: {collection.name}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {collection.items.length === 0 ? (
            <div className="text-zinc-500">No items in this collection.</div>
          ) : (
            collection.items.map((id) => {
              const item = userCharacters.find((c) => c.id === id);
              return item ? (
                <PromptCard key={id} prompt={item} />
              ) : null;
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}