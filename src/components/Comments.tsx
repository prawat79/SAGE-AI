import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Comments({ comments = [], onAdd }) {
  const [text, setText] = useState("");
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      <div className="space-y-4 mb-4">
        {comments.map((c, i) => (
          <div key={i} className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
            <div className="font-medium">{c.user}</div>
            <div className="text-sm">{c.text}</div>
          </div>
        ))}
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (text.trim()) {
            onAdd(text);
            setText("");
          }
        }}
        className="flex flex-col gap-2"
      >
        <Textarea
          placeholder="Add a comment..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <Button type="submit" size="sm">Post</Button>
      </form>
    </div>
  );
}