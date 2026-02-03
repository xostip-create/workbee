'use client';

import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Loader2, MapPin } from "lucide-react";
import { WorkerCard } from "@/components/dashboard/worker-card";
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { UserProfile, WorkerProfile, DisplayWorker } from '@/types';
import { useMemo } from 'react';
import { getDistance } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function SearchPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  // 1. Get current user's profile
  const currentUserProfileRef = useMemoFirebase(() => user ? doc(firestore, 'userProfiles', user.uid) : null, [firestore, user]);
  const { data: currentUserProfile, isLoading: isLoadingCurrentUser } = useDoc<UserProfile>(currentUserProfileRef);

  // 2. Get all approved worker profiles
  const approvedWorkersQuery = useMemoFirebase(() => query(collection(firestore, 'workerProfiles'), where('status', '==', 'Approved')), [firestore]);
  const { data: approvedWorkers, isLoading: isLoadingWorkers } = useCollection<WorkerProfile>(approvedWorkersQuery);
  
  // 3. Get all user profiles to match with workers
  const allUserProfilesRef = useMemoFirebase(() => collection(firestore, 'userProfiles'), [firestore]);
  const { data: allUserProfiles, isLoading: isLoadingUserProfiles } = useCollection<UserProfile>(allUserProfilesRef);

  // 4. Combine data and calculate distances
  const displayWorkers = useMemo(() => {
    if (!approvedWorkers || !allUserProfiles || !currentUserProfile) {
      return [];
    }

    const profilesMap = new Map(allUserProfiles.map(p => [p.id, p]));
    const customerLat = currentUserProfile?.locationLatitude;
    const customerLon = currentUserProfile?.locationLongitude;

    const workersWithDistances: DisplayWorker[] = approvedWorkers.map(worker => {
      const profile = profilesMap.get(worker.userAccountId);
      if (!profile) return null;

      let distance: number | null = null;
      if (customerLat && customerLon && profile.locationLatitude && profile.locationLongitude) {
        distance = getDistance(customerLat, customerLon, profile.locationLatitude, profile.locationLongitude);
      }
      
      return {
        id: worker.userAccountId,
        name: profile.fullName,
        location: profile.address || 'Location not set',
        skills: worker.skillCategoryIds, // In a real app, you'd map IDs to names
        rating: 4.5, // Placeholder rating
        avatar: profile.profilePhoto || `https://picsum.photos/seed/${profile.id}/200/200`,
        verified: worker.status === 'Approved',
        distance: distance,
      };
    }).filter((w): w is DisplayWorker => w !== null);

    // Sort by distance (null distances at the end)
    workersWithDistances.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
    });

    return workersWithDistances;

  }, [approvedWorkers, allUserProfiles, currentUserProfile]);

  const isLoading = isLoadingWorkers || isLoadingUserProfiles || isLoadingCurrentUser;

  if (!isLoading && currentUserProfile && (!currentUserProfile.locationLatitude || !currentUserProfile.locationLongitude)) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Search for Workers</h1>
                <p className="text-muted-foreground">Find the perfect professional for your job.</p>
            </div>
            <Alert>
                <MapPin className="h-4 w-4" />
                <AlertTitle>Set Your Location</AlertTitle>
                <AlertDescription>
                    Please <Link href="/dashboard/profile" className="font-bold underline">set your location</Link> in your profile to search for nearby workers.
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search for Workers</h1>
        <p className="text-muted-foreground">Find the perfect professional for your job.</p>
      </div>
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by skill, name, or location..."
          className="w-full pl-8 sm:w-[300px] md:w-1/3"
        />
      </div>

      {isLoading ? (
         <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
         </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayWorkers.length > 0 ? (
            displayWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground">
                <p>No approved workers found in your area.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
