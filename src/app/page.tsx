import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <Button asChild className="bg-gray-100 hover:bg-gray-200">
        <Link href="/sign-in">Sign In With Google</Link>
      </Button>
    </div>
  );
}
