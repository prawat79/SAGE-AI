import { useEffect } from "react";

export default function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);
  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
      {message}
    </div>
  );
}