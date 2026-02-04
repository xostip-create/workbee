'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
  import {
    DollarSign,
    Activity,
    AlertCircle,
    Briefcase,
    Search,
    CheckCircle,
    FileText,
    PlusCircle,
  } from 'lucide-react';
  import Link from 'next/link';
  import { Button } from '@/components/ui/button';
  import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
  import { useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
  import { doc, collection, query, where } from 'firebase/firestore';
  import { useFirestore } from '@/firebase/provider';
  import type { UserAccount, WorkerProfile, Job, JobApplication, JobPosting } from '@/types';
  import { Loader2 } from 'lucide-react';
  import { useRouter } from 'next/navigation';
  import { useEffect, useMemo } from 'react';
  import { formatDistanceToNow } from 'date-fns';

const WorkerDashboard = () => {
    const { user } = useUser();
    const firestore = useFirestore();

    const workerProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'workerProfiles', user.uid);
    }, [firestore, user]);
    const { data: workerProfile, isLoading: isLoadingProfile } = useDoc<WorkerProfile>(workerProfileRef);

    const completedJobsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'jobs'), where('workerId', '==', user.uid), where('status', '==', 'Completed'));
    }, [firestore, user]);
    const { data: completedJobs, isLoading: isLoadingCompleted } = useCollection<Job>(completedJobsQuery);

    const activeJobsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'jobs'), where('workerId', '==', user.uid), where('status', '==', 'PaymentSecured'));
    }, [firestore, user]);
    const { data: activeJobs, isLoading: isLoadingActive } = useCollection<Job>(activeJobsQuery);

    const applicationsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'jobApplications'), where('workerId', '==', user.uid));
    }, [firestore, user]);
    const { data: applications, isLoading: isLoadingApps } = useCollection<JobApplication>(applicationsQuery);

    const totalEarnings = useMemo(() => completedJobs?.reduce((sum, job) => sum + job.price, 0) || 0, [completedJobs]);
    const jobsCompletedCount = completedJobs?.length || 0;
    const activeJobsCount = activeJobs?.length || 0;
    const pendingApplicationsCount = useMemo(() => applications?.filter(app => app.status === 'pending').length || 0, [applications]);

    const isLoading = isLoadingProfile || isLoadingCompleted || isLoadingActive || isLoadingApps;

    const RecentApplications = () => (
        <Card>
            <CardHeader>
                <CardTitle>Recent Job Applications</CardTitle>
                <CardDescription>The status of your recent applications.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="max-w-[150px]">Job</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Applied</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingApps ? (
                            <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
                        ) : applications && applications.length > 0 ? (
                            applications.slice(0, 5).map(app => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium truncate">
                                        <Link href={`/dashboard/jobs/${app.jobPostingId}`} className="hover:underline">
                                            {app.jobPostingId}
                                        </Link>
                                    </TableCell>
                                    <TableCell><Badge variant={app.status === 'accepted' ? 'default' : app.status === 'pending' ? 'outline' : 'destructive'} className="capitalize">{app.status}</Badge></TableCell>
                                    <TableCell className="text-muted-foreground">{formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">No applications yet.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Worker Dashboard</h1>
                <Button asChild>
                    <Link href="/dashboard/jobs">
                        <Search className="mr-2 h-4 w-4" /> Find Jobs
                    </Link>
                </Button>
            </div>

            {workerProfile?.status === 'Pending Approval' && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Verification Pending</AlertTitle>
                    <AlertDescription>
                        Your profile is under review. You can browse jobs, but you won't be able to apply until approved. You can complete your profile details in the meantime by visiting the <Link href="/dashboard/profile" className="font-bold underline">Profile</Link> page.
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
                        <div className="text-2xl font-bold">₦{totalEarnings.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From {jobsCompletedCount} completed jobs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeJobsCount}</div>
                        <p className="text-xs text-muted-foreground">Jobs currently in progress</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{jobsCompletedCount}</div>
                        <p className="text-xs text-muted-foreground">All-time completed jobs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingApplicationsCount}</div>
                        <p className="text-xs text-muted-foreground">Awaiting customer response</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Active Jobs</CardTitle>
                        <CardDescription>Jobs that are currently in progress.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="text-right">View</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingActive ? (
                                    <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
                                ) : activeJobs && activeJobs.length > 0 ? (
                                    activeJobs.map(job => (
                                        <TableRow key={job.id}>
                                            <TableCell className="font-medium max-w-xs truncate">{job.title}</TableCell>
                                            <TableCell>₦{job.price.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/dashboard/messages?to=${job.customerId}`}>Chat</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">No active jobs.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <RecentApplications />
            </div>
        </div>
    );
};
  
const CustomerDashboard = () => {
    const { user } = useUser();
    const firestore = useFirestore();

    const completedJobsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'jobs'), where('customerId', '==', user.uid), where('status', '==', 'Completed'));
    }, [firestore, user]);
    const { data: completedJobs, isLoading: isLoadingCompleted } = useCollection<Job>(completedJobsQuery);

    const activeJobsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'jobs'), where('customerId', '==', user.uid), where('status', '==', 'PaymentSecured'));
    }, [firestore, user]);
    const { data: activeJobs, isLoading: isLoadingActive } = useCollection<Job>(activeJobsQuery);

    const openPostingsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'jobPostings'), where('customerId', '==', user.uid), where('status', '==', 'open'));
    }, [firestore, user]);
    const { data: openPostings, isLoading: isLoadingOpenPostings } = useCollection<JobPosting>(openPostingsQuery);

    const totalSpent = useMemo(() => completedJobs?.reduce((sum, job) => sum + job.totalAmount, 0) || 0, [completedJobs]);
    const jobsCompletedCount = completedJobs?.length || 0;
    const activeJobsCount = activeJobs?.length || 0;
    const openPostingsCount = openPostings?.length || 0;

    const isLoading = isLoadingCompleted || isLoadingActive || isLoadingOpenPostings;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Customer Dashboard</h1>
                <Button asChild>
                    <Link href="/dashboard/jobs/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Post a New Job
                    </Link>
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₦{totalSpent.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">On {jobsCompletedCount} completed jobs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeJobsCount}</div>
                        <p className="text-xs text-muted-foreground">Jobs currently in progress</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Job Postings</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{openPostingsCount}</div>
                        <p className="text-xs text-muted-foreground">Awaiting applications</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default function DashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    
    const userAccountRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'userAccounts', user.uid);
    }, [firestore, user]);

    const { data: userAccount, isLoading } = useDoc<UserAccount>(userAccountRef);

    useEffect(() => {
        if (userAccount && userAccount.role === 'admin') {
            router.replace('/admin');
        }
    }, [userAccount, router]);

    if (isLoading || !userAccount || userAccount.role === 'admin') {
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
      default:
        content = <p>Welcome to your dashboard.</p>;
    }
  
    return (
      <div className="space-y-4">
        {content}
      </div>
    );
}
