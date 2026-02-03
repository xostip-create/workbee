'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Loader2 } from 'lucide-react';
import type { UserAccount } from '@/types';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userAccountRef = useMemoFirebase(() => user ? doc(firestore, 'userAccounts', user.uid) : null, [firestore, user]);
  const { data: userAccount, isLoading: isAccountLoading } = useDoc<UserAccount>(userAccountRef);

  useEffect(() => {
    // If auth is done loading and there's no user, redirect to login
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [isUserLoading, user, router]);

  const isLoading = isUserLoading || isAccountLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // After loading, if there's no account or the role is not admin, show access denied.
  if (!userAccount || userAccount.role !== 'admin') {
      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>You do not have the required permissions to view this page. Please contact an administrator if you believe this is an error.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
                </CardContent>
            </Card>
        </div>
      )
  }

  // If user is admin, render the layout
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AppSidebar />
        <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <DashboardHeader />
            <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
