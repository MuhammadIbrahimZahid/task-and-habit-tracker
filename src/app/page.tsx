import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <Button asChild>
        <Link href="/sign-in">Sign In With Google</Link>
      </Button>
    </div>
  );
}
