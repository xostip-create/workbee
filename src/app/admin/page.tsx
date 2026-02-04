'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from '@/components/ui/card';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { Badge } from '@/components/ui/badge';
  import { Button } from '@/components/ui/button';
  import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking, useDoc } from '@/firebase';
  import { collection, doc, query, where } from 'firebase/firestore';
  import type { WorkerProfile, UserAccount, Job, AppSettings } from '@/types';
  import { Loader2, Users, Briefcase, DollarSign, UserCheck, UserCog } from 'lucide-react';
  import { toast } from '@/hooks/use-toast';
  import { useMemo } from 'react';
  import { Switch } from '@/components/ui/switch';
  
  function AdminStats() {
    const firestore = useFirestore();

    const pendingWorkersQuery = useMemoFirebase(() => {
        return query(collection(firestore, 'workerProfiles'), where('status', '==', 'Pending Approval'));
    }, [firestore]);
    const { data: pendingUsers, isLoading: isLoadingPending } = useCollection<WorkerProfile>(pendingWorkersQuery);

    const allUsersQuery = useMemoFirebase(() => collection(firestore, 'userAccounts'), [firestore]);
    const { data: allUsers, isLoading: isLoadingUsers } = useCollection<UserAccount>(allUsersQuery);
    
    const allJobsQuery = useMemoFirebase(() => collection(firestore, 'jobs'), [firestore]);
    const { data: allJobs, isLoading: isLoadingJobs } = useCollection<Job>(allJobsQuery);

    const completedJobsQuery = useMemoFirebase(() => query(collection(firestore, 'jobs'), where('status', '==', 'Completed')), [firestore]);
    const { data: completedJobs, isLoading: isLoadingCompletedJobs } = useCollection<Job>(completedJobsQuery);

    const totalRevenue = completedJobs?.reduce((sum, job) => sum + job.serviceFee, 0) || 0;

    const isLoading = isLoadingPending || isLoadingUsers || isLoadingJobs || isLoadingCompletedJobs;

    if (isLoading) {
        return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader><CardTitle>Pending Approvals</CardTitle></CardHeader><CardContent><Loader2 className="animate-spin" /></CardContent></Card>
            <Card><CardHeader><CardTitle>Total Users</CardTitle></CardHeader><CardContent><Loader2 className="animate-spin" /></CardContent></Card>
            <Card><CardHeader><CardTitle>Total Jobs</CardTitle></CardHeader><CardContent><Loader2 className="animate-spin" /></CardContent></Card>
            <Card><CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader><CardContent><Loader2 className="animate-spin" /></CardContent></Card>
        </div>
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingUsers?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Workers waiting for verification.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{allUsers?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Total users on the platform.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{allJobs?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Jobs created, both active and completed.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">From completed jobs service fees.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  function PendingWorkersTable() {
    const firestore = useFirestore();

    const pendingWorkersQuery = useMemoFirebase(() => {
        return query(collection(firestore, 'workerProfiles'), where('status', '==', 'Pending Approval'));
    }, [firestore]);

    const { data: pendingUsers, isLoading } = useCollection<WorkerProfile>(pendingWorkersQuery);

    const handleApproval = (workerProfileId: string, newStatus: 'Approved' | 'Blocked') => {
        if (!workerProfileId) return;
        const workerDocRef = doc(firestore, 'workerProfiles', workerProfileId);
        updateDocumentNonBlocking(workerDocRef, { status: newStatus });
        toast({
            title: `User ${newStatus}`,
            description: `The worker has been ${newStatus.toLowerCase()}.`,
        });
    };

    return (
         <Card>
          <CardHeader>
            <CardTitle>Pending Worker Approvals</CardTitle>
            <CardDescription>
              The following workers are waiting for verification. Review their profile before approving.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker User ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        </TableCell>
                    </TableRow>
                ) : pendingUsers && pendingUsers.length > 0 ? (
                    pendingUsers.map(user => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.userAccountId}</TableCell>
                        <TableCell>
                        <Badge variant="outline" className="capitalize">{user.status}</Badge>
                        </TableCell>
                        <TableCell>{user.availability}</TableCell>
                        <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" asChild>
                                <a href={`/profile/${user.userAccountId}`} target="_blank" rel="noopener noreferrer">View Profile</a>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleApproval(user.id, 'Approved')}>
                            Approve
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleApproval(user.id, 'Blocked')}>
                            Reject
                            </Button>
                        </div>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">No pending approvals.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    )
  }

  function PendingAdminsTable() {
    const firestore = useFirestore();

    const adminUsersQuery = useMemoFirebase(() => {
        return query(collection(firestore, 'userAccounts'), where('role', '==', 'admin'));
    }, [firestore]);
    const { data: adminUsers, isLoading: isLoadingAdmins } = useCollection<UserAccount>(adminUsersQuery);
    
    const approvedAdminsQuery = useMemoFirebase(() => collection(firestore, 'roles_admin'), [firestore]);
    const { data: approvedAdmins, isLoading: isLoadingApproved } = useCollection(approvedAdminsQuery);

    const pendingAdmins = useMemo(() => {
        if (!adminUsers || !approvedAdmins) return [];
        const approvedAdminIds = new Set(approvedAdmins.map(admin => admin.id));
        return adminUsers.filter(user => !approvedAdminIds.has(user.id));
    }, [adminUsers, approvedAdmins]);

    const handleApproval = (userId: string) => {
        if (!userId) return;
        const adminRoleRef = doc(firestore, 'roles_admin', userId);
        // Create an empty document. Its existence grants admin rights.
        setDocumentNonBlocking(adminRoleRef, {}, { merge: false });
        toast({
            title: "Admin Approved",
            description: `User ${userId} has been granted administrator privileges.`,
        });
    };

    const isLoading = isLoadingAdmins || isLoadingApproved;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending Admin Approvals</CardTitle>
                <CardDescription>The following users have registered as admins and are waiting for approval.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : pendingAdmins.length > 0 ? (
                            pendingAdmins.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.id}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleApproval(user.id)}>
                                            <UserCog className="mr-2 h-4 w-4" />
                                            Approve Admin
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">No pending admin approvals.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

  function SignupSettings() {
    const firestore = useFirestore();
    const settingsRef = useMemoFirebase(() => doc(firestore, 'appSettings', 'general'), [firestore]);
    const { data: settings, isLoading } = useDoc<AppSettings>(settingsRef);

    const handleToggle = (enabled: boolean) => {
        // Use set with merge to create the doc if it doesn't exist
        setDocumentNonBlocking(settingsRef, { signupEnabled: enabled }, { merge: true });
        toast({
            title: 'Settings Updated',
            description: `User signups have been ${enabled ? 'enabled' : 'disabled'}.`,
        });
    };

    if (isLoading) {
        return <Card><CardHeader><CardTitle>Platform Settings</CardTitle></CardHeader><CardContent><Loader2 className="animate-spin" /></CardContent></Card>
    }

    // Default to true if settings doc doesn't exist yet
    const signupEnabled = settings?.signupEnabled ?? true;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Manage global settings for the application.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <h3 className="font-medium">Enable User Signups</h3>
                        <p className="text-sm text-muted-foreground">
                            Allow new users (workers and customers) to register.
                        </p>
                    </div>
                    <Switch
                        checked={signupEnabled}
                        onCheckedChange={handleToggle}
                        aria-label="Toggle user signups"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
  
  export default function AdminPage() {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Oversee and manage the E&F WorkBee platform.</p>
        </div>
        <AdminStats />
        <SignupSettings />
        <PendingAdminsTable />
        <PendingWorkersTable />
      </div>
    );
  }
