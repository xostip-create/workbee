'use client';

import type { CustomerProfile, UserProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface CustomerProfileViewProps {
  userProfile: UserProfile;
  customerProfile: CustomerProfile;
}

export function CustomerProfileView({ userProfile, customerProfile }: CustomerProfileViewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={userProfile.profilePhoto} alt={userProfile.fullName} data-ai-hint="person smiling" />
              <AvatarFallback>{userProfile.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{userProfile.fullName}</h2>
            <p className="text-muted-foreground">Customer</p>
            <div className="mt-4 flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{(customerProfile.averageRating || 0).toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({customerProfile.reviewsCount || 0} reviews)</span>
            </div>
          </CardContent>
        </Card>
      </div>
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
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-4">No job history to display yet.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
