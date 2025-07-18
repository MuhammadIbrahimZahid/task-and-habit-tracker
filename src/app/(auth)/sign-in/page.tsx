'use client';

import { signInWithGoogle } from '@/actions/auth';
import { Button } from '@/components/ui/button';

export default function SignInPage() {
  async function handleSignIn() {
    try {
      const { url } = await signInWithGoogle('/dashboard');
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="bg-white w-full sm:w-96 px-4 sm:px-8 py-10 rounded shadow space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-medium tracking-tight text-black">
            Sign In With Google
          </h1>
        </header>

        <Button
          onClick={handleSignIn}
          className="w-full bg-gray-100 hover:bg-gray-200 text-black flex items-center justify-center gap-x-3"
          variant="ghost"
        >
          Continue With Google
        </Button>
      </div>
    </div>
  );
}
