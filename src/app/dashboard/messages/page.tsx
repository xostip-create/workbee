'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function MessagesRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const to = searchParams.get('to');

  useEffect(() => {
    let url = '/dashboard?openChat=true';
    if (to) {
      url += `&to=${to}`;
    }
    router.replace(url);
  }, [router, to]);

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
        <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            <p className="mt-4 text-muted-foreground">Opening messages...</p>
        </div>
    </div>
  );
}


export default function MessagesRedirectPage() {
  return (
    <Suspense fallback={
        <div className="flex h-full w-full items-center justify-center p-8">
            <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
        </div>
    }>
      <MessagesRedirect />
    </Suspense>
  )
}
