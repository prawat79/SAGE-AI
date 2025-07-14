import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Home, User, MessageCircle, Plus } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 bg-white dark:bg-zinc-900 border-r flex flex-col">
      <div className="p-4 flex items-center gap-2">
        <Avatar>
          <img src="/logo.svg" alt="SAGE-AI" />
        </Avatar>
        <span className="font-bold text-lg">SAGE-AI</span>
      </div>
      <nav className="flex-1 flex flex-col gap-2 p-4">
        <Button variant="ghost" className="justify-start" asChild>
          <a href="/explore"><Home className="mr-2" /> Explore</a>
        </Button>
        <Button variant="ghost" className="justify-start" asChild>
          <a href="/chats"><MessageCircle className="mr-2" /> My Chats</a>
        </Button>
        <Button variant="ghost" className="justify-start" asChild>
          <a href="/create"><Plus className="mr-2" /> Create</a>
        </Button>
        <Button variant="ghost" className="justify-start" asChild>
          <a href="/profile"><User className="mr-2" /> Profile</a>
        </Button>
      </nav>
    </aside>
  );
}