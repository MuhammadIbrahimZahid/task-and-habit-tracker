'use client';
import { Button } from '@/components/ui/button';
import { signOut } from '@/actions/auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace('/sign-in');
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">DashboardPage</h1>
      <Button
        onClick={handleSignOut}
        className="bg-gray-100 hover:bg-gray-200 mt-4"
      >
        Sign Out
      </Button>
    </div>
  );
}
