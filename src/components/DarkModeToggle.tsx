import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const theme = localStorage.theme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setIsDark(theme === "dark");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);
  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };
  return (
    <button
      className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
      onClick={toggle}
      aria-label="Toggle dark mode"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}