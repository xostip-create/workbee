'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { JobPosting, UserAccount } from '@/types';
import { collection, doc, query, where } from 'firebase/firestore';
import { Briefcase, Loader2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const CustomerJobs = () => {
    const { user } = useUser();
    const firestore = useFirestore();

    const myJobsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'jobPostings'), where('customerId', '==', user.uid));
    }, [user, firestore]);

    const { data: jobs, isLoading } = useCollection<JobPosting>(myJobsQuery);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Jobs</h1>
                    <p className="text-muted-foreground">View and manage your job postings.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/jobs/new">
                        <PlusCircle className="mr-2" /> Post a New Job
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Job History</CardTitle>
                    <CardDescription>A list of your job postings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date Posted</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell>
                                </TableRow>
                            ) : jobs && jobs.length > 0 ? (
                                jobs.map(job => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell><Badge variant={job.status === 'open' ? 'default' : 'secondary'}>{job.status}</Badge></TableCell>
                                        <TableCell>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</TableCell>
                                        <TableCell><Button variant="outline" size="sm" asChild><Link href={`/dashboard/jobs/${job.id}`}>View</Link></Button></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10">
                                        <h3 className="font-semibold">No jobs posted yet</h3>
                                        <p className="text-sm text-muted-foreground">Get started by posting a new job.</p>
                                        <Button size="sm" className="mt-4" asChild><Link href="/dashboard/jobs/new">Post a Job</Link></Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

const WorkerJobs = () => {
    const firestore = useFirestore();

    const availableJobsQuery = useMemoFirebase(() => {
        return query(collection(firestore, 'jobPostings'), where('status', '==', 'open'));
    }, [firestore]);

    const { data: jobs, isLoading } = useCollection<JobPosting>(availableJobsQuery);
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Available Jobs</h1>
                <p className="text-muted-foreground">Find jobs that match your skills and location.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Open for Application</CardTitle>
                    <CardDescription>A list of jobs you can apply for, sorted by the most recent.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Skills</TableHead>
                                <TableHead>Posted</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : jobs && jobs.length > 0 ? (
                                jobs.map(job => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium max-w-xs truncate">{job.title}</TableCell>
                                        <TableCell className="text-muted-foreground">{job.address || 'Not specified'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {job.skillCategoryIds.slice(0, 2).map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                                                {job.skillCategoryIds.length > 2 && <Badge variant="outline">+{job.skillCategoryIds.length - 2}</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild size="sm">
                                                <Link href={`/dashboard/jobs/${job.id}`}>View & Apply</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center">
                                        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 font-semibold">No Available Jobs</h3>
                                        <p className="text-sm text-muted-foreground">There are currently no open jobs. Check back later!</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </div>
    )
}


export default function JobsPage() {
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
  
    if (userAccount.role === 'customer') {
        return <CustomerJobs />;
    }

    if (userAccount.role === 'worker') {
        return <WorkerJobs />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold">Jobs</h1>
            <p>You do not have access to this page.</p>
        </div>
    );
}

    
