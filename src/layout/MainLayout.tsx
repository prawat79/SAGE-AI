import Sidebar from "@/components/layout/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-6">
        {children}
      </main>
    </div>
  );
}