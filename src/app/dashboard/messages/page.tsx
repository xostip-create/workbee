'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function MessagesRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard?openChat=true');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
        <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            <p className="mt-4 text-muted-foreground">Opening messages...</p>
        </div>
    </div>
  );
}
