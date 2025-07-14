import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Collections({ collections = [], onCreate, onSelect }) {
  const [name, setName] = useState("");
  return (
    <div className="my-8">
      <h3 className="text-lg font-semibold mb-4">My Collections</h3>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="New collection name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Button
          onClick={() => {
            if (name.trim()) {
              onCreate(name);
              setName("");
            }
          }}
        >
          Create
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {collections.map((col, i) => (
          <Card
            key={i}
            className="p-4 cursor-pointer hover:shadow-lg"
            onClick={() => onSelect(col)}
          >
            <div className="font-bold">{col.name}</div>
            <div className="text-sm text-zinc-500">{col.items.length} items</div>
          </Card>
        ))}
      </div>
    </div>
  );
}