'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useDoc, useCollection, useUser, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, documentId } from 'firebase/firestore';
import type { JobPosting, UserProfile, JobApplication, WorkerProfile, UserAccount } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MapPin, Calendar, Briefcase, FileText, Send, UserCheck, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function ApplyButton({ jobPosting, workerProfile }: { jobPosting: JobPosting, workerProfile: WorkerProfile | null }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const applicationsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'jobPostings', jobPosting.id, 'applications'), where('workerId', '==', user.uid));
    }, [firestore, user, jobPosting.id]);
    const { data: existingApplications, isLoading: isLoadingApps } = useCollection<JobApplication>(applicationsQuery);

    const handleApply = async () => {
        if (!user) return;
        
        const applicationRef = collection(firestore, 'jobPostings', jobPosting.id, 'applications');

        addDocumentNonBlocking(applicationRef, {
            jobPostingId: jobPosting.id,
            workerId: user.uid,
            customerId: jobPosting.customerId,
            status: 'pending',
            createdAt: new Date().toISOString(),
        });
        
        toast({
            title: 'Application Sent!',
            description: 'The customer has been notified of your interest.',
        });
    };

    if (isLoadingApps) {
        return <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</Button>;
    }
    if (existingApplications && existingApplications.length > 0) {
        return <Button disabled variant="outline"><CheckCircle className="mr-2" /> Applied</Button>
    }
    if (workerProfile?.status !== 'Approved') {
        return <Button disabled title="Your profile is not yet approved"><UserCheck className="mr-2" /> Approval Pending</Button>
    }

    return <Button onClick={handleApply}><FileText className="mr-2"/> Apply Now</Button>;
}

function ApplicantList({ jobPostingId }: { jobPostingId: string }) {
    const firestore = useFirestore();

    const applicantsQuery = useMemoFirebase(() => {
        return query(collection(firestore, 'jobPostings', jobPostingId, 'applications'));
    }, [firestore, jobPostingId]);
    const { data: applications, isLoading: isLoadingApps } = useCollection<JobApplication>(applicantsQuery);

    const applicantIds = useMemo(() => applications?.map(app => app.workerId) || [], [applications]);
    
    const applicantProfilesQuery = useMemoFirebase(() => {
        if (applicantIds.length === 0) return null;
        return query(collection(firestore, 'userProfiles'), where(documentId(), 'in', applicantIds));
    }, [firestore, applicantIds]);
    const { data: applicantProfiles, isLoading: isLoadingProfiles } = useCollection<UserProfile>(applicantProfilesQuery);
    
    const profilesMap = useMemo(() => {
        if (!applicantProfiles) return new Map();
        return new Map(applicantProfiles.map(p => [p.id, p]));
    }, [applicantProfiles]);


    if (isLoadingApps || isLoadingProfiles) {
        return <div className="text-center"><Loader2 className="animate-spin" /></div>
    }

    if (!applications || applications.length === 0) {
        return <p className="text-center text-muted-foreground">No applications received yet.</p>
    }

    return (
        <div className="space-y-4">
            {applications.map(app => {
                const profile = profilesMap.get(app.workerId);
                return (
                     <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={profile?.profilePhoto} />
                                <AvatarFallback>{profile?.fullName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{profile?.fullName || 'Loading...'}</p>
                                <p className="text-sm text-muted-foreground">Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button size="sm" variant="outline" asChild>
                                <Link href={`/profile/${app.workerId}`}>View Profile</Link>
                            </Button>
                             <Button size="sm" asChild>
                                <Link href={`/dashboard/messages?to=${app.workerId}`}><Send className="mr-2"/> Message</Link>
                            </Button>
                        </div>
                     </div>
                );
            })}
        </div>
    )

}

export default function JobDetailsPage() {
    const params = useParams();
    const jobId = params.jobId as string;
    const { user } = useUser();
    const firestore = useFirestore();

    const jobPostingRef = useMemoFirebase(() => doc(firestore, 'jobPostings', jobId), [firestore, jobId]);
    const { data: jobPosting, isLoading: isLoadingJob } = useDoc<JobPosting>(jobPostingRef);

    const customerProfileRef = useMemoFirebase(() => {
        if (!jobPosting) return null;
        return doc(firestore, 'userProfiles', jobPosting.customerId);
    }, [firestore, jobPosting]);
    const { data: customerProfile, isLoading: isLoadingCustomer } = useDoc<UserProfile>(customerProfileRef);

    const userAccountRef = useMemoFirebase(() => user ? doc(firestore, 'userAccounts', user.uid) : null, [firestore, user]);
    const { data: userAccount, isLoading: isLoadingUserAccount } = useDoc<UserAccount>(userAccountRef);
    
    const workerProfileRef = useMemoFirebase(() => user ? doc(firestore, 'workerProfiles', user.uid) : null, [firestore, user]);
    const { data: workerProfile, isLoading: isLoadingWorkerProfile } = useDoc<WorkerProfile>(workerProfileRef);

    const isLoading = isLoadingJob || isLoadingCustomer || isLoadingUserAccount || isLoadingWorkerProfile;
    const isOwner = user?.uid === jobPosting?.customerId;

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!jobPosting) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold">Job Not Found</h1>
                <p className="text-muted-foreground">This job posting may have been removed or does not exist.</p>
                <Button asChild className="mt-4"><Link href="/dashboard/jobs">Go back to jobs</Link></Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant="secondary" className="capitalize mb-2">{jobPosting.jobType}</Badge>
                            <CardTitle className="text-3xl">{jobPosting.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-2">
                                <MapPin className="h-4 w-4"/> {jobPosting.address}
                            </CardDescription>
                        </div>
                        <div className="text-right">
                           <p className="text-sm text-muted-foreground">Posted</p>
                           <p className="font-medium">{formatDistanceToNow(new Date(jobPosting.createdAt), {addSuffix: true})}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{jobPosting.description}</p>
                </CardContent>
                <CardFooter className="flex-col items-start gap-4">
                     <div>
                        <h4 className="font-semibold mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {jobPosting.skillCategoryIds.map(skill => <Badge key={skill}>{skill}</Badge>)}
                        </div>
                     </div>
                </CardFooter>
            </Card>

            {userAccount?.role === 'worker' && !isOwner && (
                <Card>
                    <CardHeader>
                        <CardTitle>Ready to work?</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ApplyButton jobPosting={jobPosting} workerProfile={workerProfile} />
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                     <Card>
                        <CardHeader>
                            <CardTitle>About the Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                             <Avatar className="h-16 w-16">
                                <AvatarImage src={customerProfile?.profilePhoto} />
                                <AvatarFallback>{customerProfile?.fullName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-lg">{customerProfile?.fullName}</p>
                                <Button size="sm" variant="outline" className="mt-1" asChild>
                                    <Link href={`/profile/${jobPosting.customerId}`}>View Profile</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {isOwner && (
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Applications</CardTitle>
                                <CardDescription>Workers who have applied for this job.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ApplicantList jobPostingId={jobId} />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
