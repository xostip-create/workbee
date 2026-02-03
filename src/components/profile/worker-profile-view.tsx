'use client';

import type { WorkerProfile, UserProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Verified, MapPin, Briefcase, Calendar, Video } from 'lucide-react';
import Image from 'next/image';

interface WorkerProfileViewProps {
  userProfile: UserProfile;
  workerProfile: WorkerProfile;
  distance: number | null;
}

export function WorkerProfileView({ userProfile, workerProfile, distance }: WorkerProfileViewProps) {
  const isApproved = workerProfile.status === 'Approved';

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Left Column */}
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={userProfile.profilePhoto} alt={userProfile.fullName} data-ai-hint="person smiling"/>
              <AvatarFallback>{userProfile.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{userProfile.fullName}</h2>
                {isApproved && <Verified className="h-6 w-6 text-primary" />}
            </div>
            {distance !== null && (
                <div className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{userProfile.address} ({distance.toFixed(1)} km away)</span>
                </div>
            )}
            <div className="mt-4 flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{(workerProfile.averageRating || 0).toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({workerProfile.reviewsCount || 0} reviews)</span>
            </div>
             <Button className="mt-4 w-full">Contact Worker</Button>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium">{workerProfile.completedJobsCount || 0}</p>
                        <p className="text-muted-foreground text-xs">Jobs Completed</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium">{workerProfile.availability}</p>
                        <p className="text-muted-foreground text-xs">Availability</p>
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
                <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {workerProfile.skillCategoryIds.length > 0 ? (
                    workerProfile.skillCategoryIds.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)
                ) : (
                    <p className="text-sm text-muted-foreground">No skills listed.</p>
                )}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Work Showcase</CardTitle>
                <CardDescription>Approved videos and images from past jobs.</CardDescription>
            </CardHeader>
            <CardContent>
                {workerProfile.videoUrl ? (
                     <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">Video player placeholder</p>
                     </div>
                ): (
                    <div className="text-center text-muted-foreground py-8">
                        <Video className="mx-auto h-12 w-12" />
                        <p className="mt-2">No videos have been uploaded.</p>
                    </div>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-4">No reviews yet.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
