import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Welcome to TaskHabit
        </h1>
        <p className="text-black max-w-md mx-auto">
          Organize your day. Build better habits. Sign in to start tracking.
        </p>

        <Button
          asChild
          className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-3 text-base rounded-md"
        >
          <Link href="/sign-in">Let's Start</Link>
        </Button>
      </div>
    </main>
  );
}
