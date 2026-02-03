'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
                    <CardDescription>A list of jobs you can apply for.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
                        ) : jobs && jobs.length > 0 ? (
                            jobs.map(job => (
                                <Card key={job.id}>
                                    <CardHeader>
                                        <CardTitle>{job.title}</CardTitle>
                                        <CardDescription>{job.address || 'Location not specified'}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="line-clamp-2 text-sm">{job.description}</p>
                                        <div className="flex gap-2 mt-2">
                                            {job.skillCategoryIds.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                                        <Button asChild><Link href={`/dashboard/jobs/${job.id}`}>View & Apply</Link></Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                             <div className="text-center text-muted-foreground py-10">
                                <Briefcase className="mx-auto h-12 w-12" />
                                <h3 className="font-semibold mt-4">No Available Jobs</h3>
                                <p className="text-sm">There are currently no open jobs. Check back later!</p>
                            </div>
                        )}
                   </div>
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

    