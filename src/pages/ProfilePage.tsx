import MainLayout from "@/layout/MainLayout";
import { Card } from "@/components/ui/card";
import Collections from "@/components/Collections";
import PromptCard from "@/components/PromptCard";
import Toast from "@/components/ui/toast";
import { useState } from "react";
import { Share2 } from "lucide-react";

export default function ProfilePage() {
  // TODO: Replace any with real user type
  const user: any = {};
  // TODO: Replace any[] with real character type
  const userCharacters: any[] = [];
  // ...fetch logic here...
  // TODO: Replace any with real collection type
  const [collections, setCollections] = useState<any[]>([
    { name: "Favorites", items: [] },
    { name: "Funny Bots", items: [] },
  ]);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const handleCreateCollection = (name: any) => {
    setCollections((prev: any[]) => [...prev, { name, items: [] }]);
  };
  const handleSelectCollection = (col: any) => {
    setSelectedCollection(col);
  };
  const handleAddToCollection = (collectionName: any, promptId: any) => {
    setCollections((prev: any[]) =>
      prev.map((col: any) =>
        col.name === collectionName && !col.items.includes(promptId)
          ? { ...col, items: [...col.items, promptId] }
          : col
      )
    );
  };
  const [showToast, setShowToast] = useState(false);
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
          {userCharacters.map((character: any) => (
            <PromptCard
              key={character.id}
              prompt={character}
              collections={collections}
              onAddToCollection={handleAddToCollection}
            />
          ))}
        </div>
        <Collections collections={collections} onCreate={handleCreateCollection} onSelect={handleSelectCollection} />
        {selectedCollection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded shadow-lg w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{selectedCollection.name} ({selectedCollection.items.length} items)</h3>
                <button
                  className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + `/collections/${encodeURIComponent(selectedCollection.name)}`);
                    setShowToast(true);
                  }}
                  title="Share collection"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 mb-4">
                {selectedCollection.items.length === 0 ? (
                  <div className="text-zinc-500">No items in this collection.</div>
                ) : (
                  selectedCollection.items.map((id: any) => {
                    const item = userCharacters.find((c: any) => c.id === id);
                    return item ? (
                      <PromptCard key={id} prompt={item} collections={collections} onAddToCollection={handleAddToCollection} />
                    ) : null;
                  })
                )}
              </div>
              <div className="flex justify-end">
                <button className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700" onClick={() => setSelectedCollection(null)}>Close</button>
              </div>
              <Toast message="Collection link copied!" show={showToast} onClose={() => setShowToast(false)} />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}