'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import {
    DollarSign,
    Users,
    Activity,
    AlertCircle,
    Briefcase,
  } from 'lucide-react';
  import Link from 'next/link';
  import { Button } from '@/components/ui/button';
  import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
  import { useDoc, useMemoFirebase, useUser } from '@/firebase';
  import { doc } from 'firebase/firestore';
  import { useFirestore } from '@/firebase/provider';
  import type { UserAccount, WorkerProfile } from '@/types';
  import { Loader2 } from 'lucide-react';

const WorkerDashboard = () => {
    const { user } = useUser();
    const firestore = useFirestore();

    const workerProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        // This assumes the workerProfile ID is the same as the user UID
        return doc(firestore, 'workerProfiles', user.uid);
    }, [firestore, user]);

    const { data: workerProfile, isLoading } = useDoc<WorkerProfile>(workerProfileRef);

    if (isLoading) {
        return <Loader2 className="h-6 w-6 animate-spin" />;
    }
      
    return (
        <>
          {workerProfile?.status === 'Pending Approval' && (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification Pending</AlertTitle>
                <AlertDescription>
                    Your profile is under review. We'll notify you once it's approved. You can complete your profile details in the meantime by visiting the <Link href="/dashboard/profile" className="font-bold underline">Profile</Link> page.
                </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$0.00</div>
                    <p className="text-xs text-muted-foreground">No earnings yet</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">No jobs completed</p>
                </CardContent>
            </Card>
          </div>
        </>
    );
};
  
const CustomerDashboard = () => (
    <>
      <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Button asChild>
            <Link href="/dashboard/jobs">Post a New Job</Link>
          </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">$0.00</div>
                <p className="text-xs text-muted-foreground">No jobs posted yet</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No active jobs</p>
            </CardContent>
        </Card>
      </div>
    </>
);

const AdminDashboard = () => {
    const firestore = useFirestore();
    const pendingWorkersRef = useMemoFirebase(() => {
        if (!firestore) return null;
        // In a real app, you would add a query here: query(collection(firestore, 'workerProfiles'), where('status', '==', 'Pending Approval'))
        return doc(firestore, 'workerProfiles');
    }, [firestore]);
    const { data: pendingWorkers } = useDoc<WorkerProfile[]>(pendingWorkersRef);

    const pendingCount = pendingWorkers?.length || 0;

    return (
        <>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground">New users waiting for verification</p>
                        <Button size="sm" className="mt-2" asChild>
                            <Link href="/admin">Review Now</Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">...</div>
                        <p className="text-xs text-muted-foreground">Loading...</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default function DashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    
    const userAccountRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'userAccounts', user.uid);
    }, [firestore, user]);

    const { data: userAccount, isLoading } = useDoc<UserAccount>(userAccountRef);

    if (isLoading || !userAccount) {
        return (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        );
    }
  
    let content;
    switch (userAccount.role) {
      case 'worker':
        content = <WorkerDashboard />;
        break;
      case 'customer':
        content = <CustomerDashboard />;
        break;
      case 'admin':
        content = <AdminDashboard />;
        break;
      default:
        content = <p>Welcome to your dashboard.</p>;
    }
  
    return (
      <div className="space-y-4">
        {content}
      </div>
    );
}
