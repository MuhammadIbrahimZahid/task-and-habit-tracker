'use client';
import { signInWithGoogle } from '@/actions/auth';
import { Button } from '@/components/ui/button';

export default function SignInPage() {
  async function handleSignIn() {
    const { url } = await signInWithGoogle('/dashboard');
    if (url) {
      window.location.href = url;
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="flex items-center justify-center px-4">
        <div className="w-full bg-white space-y-2 px-4 py-10 sm:w-96 sm:px-8">
          <header className="text-center pb-4">
            <h1 className=" mt-4 text-2xl font-medium tracking-tight text-black ">
              Sign In With Google
            </h1>
          </header>
          <div className="space-y-3">
            <form
              className="bg-gray-100 hover:bg-gray-200"
              action={handleSignIn}
            >
              <Button
                className="flex w-full items-center justify-center gap-x-3"
                variant="outline"
                type="submit"
              >
                Continue With Google
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
