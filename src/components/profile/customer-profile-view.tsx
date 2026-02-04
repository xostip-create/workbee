
'use client';

import type { CustomerProfile, UserProfile, Job } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Verified, Briefcase, MessageSquare, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface CustomerProfileViewProps {
  userProfile: UserProfile;
  customerProfile: CustomerProfile;
  jobs: Job[];
}

export function CustomerProfileView({ userProfile, customerProfile, jobs }: CustomerProfileViewProps) {
  const jobsPostedCount = jobs.length;
  
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Left Column */}
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={userProfile.profilePhoto} alt={userProfile.fullName} data-ai-hint="person smiling" />
              <AvatarFallback>{userProfile.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{userProfile.fullName}</h2>
              {customerProfile.isVerified && <Verified className="h-6 w-6 text-primary" />}
            </div>
            <p className="text-muted-foreground">Customer</p>
             {userProfile.address && (
                <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {userProfile.address}
                </p>
            )}
            <div className="mt-4 flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{(customerProfile.averageRating || 0).toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({customerProfile.reviewsCount || 0} reviews)</span>
            </div>
            <Button asChild className="mt-4 w-full">
              <Link href={`/dashboard/messages?to=${userProfile.id}`}>Message Customer</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{jobsPostedCount}</p>
                <p className="text-muted-foreground text-xs">Jobs Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{customerProfile.reviewsCount || 0}</p>
                <p className="text-muted-foreground text-xs">Reviews Written</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="md:col-span-2 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>About {userProfile.fullName}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{userProfile.bio || 'No bio provided.'}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Job History</CardTitle>
                <CardDescription>A record of jobs completed by workers for this customer.</CardDescription>
            </CardHeader>
            <CardContent>
              {jobs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell><Badge variant="default" className="bg-green-600 hover:bg-green-700">Completed</Badge></TableCell>
                        <TableCell>{job.completedAt ? formatDistanceToNow(new Date(job.completedAt), { addSuffix: true }) : 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No job history to display yet.</p>
              )}
            </CardContent>
        </Card>
        <Card>
          <CardHeader>
              <CardTitle>Reviews from Workers</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground text-center py-4">No reviews yet.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
