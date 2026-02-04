'use client';

import { Header } from '@/components/layout/header';
import { RegisterForm } from '@/components/auth/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { AppSettings } from '@/types';
import { Loader2, ShieldX } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(firestore, 'appSettings', 'general'), [firestore]);
  const { data: settings, isLoading } = useDoc<AppSettings>(settingsRef);
  
  // Default to enabled if settings don't exist, so signups work out-of-the-box
  const signupEnabled = settings?.signupEnabled ?? true;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      );
    }

    if (!signupEnabled) {
      return (
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <ShieldX className="h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold">Registrations Closed</h2>
          <p className="mt-2 text-muted-foreground">
            We are not accepting new signups at this time. Please check back later.
          </p>
           <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      );
    }
    
    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Enter your details below to create your account and get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-sm">
          {renderContent()}
        </Card>
      </main>
    </div>
  );
}
