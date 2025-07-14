import { Avatar } from "@/components/ui/avatar";

export default function ChatBubble({ message, isUser }) {
  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : ""}`}>
      {!isUser && <Avatar><img src={message.avatar} alt="" /></Avatar>}
      <div className={`rounded-lg px-4 py-2 max-w-md ${isUser ? "bg-blue-500 text-white" : "bg-zinc-200 dark:bg-zinc-800"}`}>
        <div className="prose prose-sm dark:prose-invert">{message.text}</div>
      </div>
      {isUser && <Avatar><img src={message.avatar} alt="" /></Avatar>}
    </div>
  );
}