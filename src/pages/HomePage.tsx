import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-violet-200 dark:from-zinc-900 dark:to-zinc-800">
      <h1 className="text-5xl font-bold mb-4">Chat with AI Characters</h1>
      <p className="text-xl mb-8 text-zinc-600 dark:text-zinc-300">Create, share, and explore AI personalities. Powered by GPT-4, Supabase, and more.</p>
      <Button size="lg" asChild>
        <a href="/explore">Get Started</a>
      </Button>
    </section>
  );
}