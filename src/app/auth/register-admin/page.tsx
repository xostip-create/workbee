import { Header } from '@/components/layout/header';
import { RegisterAdminForm } from '@/components/auth/register-admin-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function RegisterAdminPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Registration</CardTitle>
            <CardDescription>
                Create an administrator account. Your account will require approval from an existing administrator before you can access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterAdminForm />
             <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="underline text-primary">
                    Login
                </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}