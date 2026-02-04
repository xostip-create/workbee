
'use client';

import { useParams } from 'next/navigation';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserAccount, UserProfile, WorkerProfile, CustomerProfile } from '@/types';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { WorkerProfileView } from '@/components/profile/worker-profile-view';
import { CustomerProfileView } from '@/components/profile/customer-profile-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDistance } from '@/lib/utils';
import { useMemo }from 'react';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser, isUserLoading: isCurrentUserLoading } = useUser();
  const firestore = useFirestore();

  // Check if current logged-in user is an approved admin
  const adminRoleRef = useMemoFirebase(() => currentUser ? doc(firestore, 'roles_admin', currentUser.uid) : null, [firestore, currentUser]);
  const { data: adminRoleDoc, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  const isAdmin = !!adminRoleDoc;

  const currentUserProfileRef = useMemoFirebase(() => currentUser ? doc(firestore, 'userProfiles', currentUser.uid) : null, [firestore, currentUser]);
  const { data: currentUserProfile, isLoading: isLoadingCurrentUserProfile } = useDoc<UserProfile>(currentUserProfileRef);

  const userAccountRef = useMemoFirebase(() => userId ? doc(firestore, 'userAccounts', userId) : null, [firestore, userId]);
  const { data: userAccount, isLoading: isLoadingAccount } = useDoc<UserAccount>(userAccountRef);

  const userProfileRef = useMemoFirebase(() => userId ? doc(firestore, 'userProfiles', userId) : null, [firestore, userId]);
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

  const workerProfileRef = useMemoFirebase(() => (userAccount?.role === 'worker' && userId) ? doc(firestore, 'workerProfiles', userId) : null, [firestore, userId, userAccount]);
  const { data: workerProfile, isLoading: isLoadingWorker } = useDoc<WorkerProfile>(workerProfileRef);

  const customerProfileRef = useMemoFirebase(() => (userAccount?.role === 'customer' && userId) ? doc(firestore, 'customerProfiles', userId) : null, [firestore, userId, userAccount]);
  const { data: customerProfile, isLoading: isLoadingCustomer } = useDoc<CustomerProfile>(customerProfileRef);
  
  const distance = useMemo(() => {
    if (!currentUserProfile || !userProfile || !currentUserProfile.locationLatitude || !currentUserProfile.locationLongitude || !userProfile.locationLatitude || !userProfile.locationLongitude) {
        return null;
    }
    return getDistance(currentUserProfile.locationLatitude, currentUserProfile.locationLongitude, userProfile.locationLatitude, userProfile.locationLongitude);
  }, [currentUserProfile, userProfile]);


  const isLoading = isCurrentUserLoading || isLoadingCurrentUserProfile || isLoadingAccount || isLoadingProfile || isLoadingWorker || isLoadingCustomer || isAdminRoleLoading;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }
    
    if (!userAccount || !userProfile) {
      return (
          <Card>
            <CardHeader><CardTitle>Profile Not Found</CardTitle></CardHeader>
            <CardContent><p>The user profile you are looking for does not exist.</p></CardContent>
          </Card>
      );
    }

    // Visibility rules for worker profiles
    if (userAccount.role === 'worker' && workerProfile?.status !== 'Approved') {
        const isOwner = currentUser?.uid === userId;
        
        if (!isOwner && !isAdmin) {
             return (
                <Card>
                    <CardHeader><CardTitle>Profile Not Available</CardTitle></CardHeader>
                    <CardContent><p>This worker's profile is currently under review and not visible to the public.</p></CardContent>
                </Card>
            );
        }
    }

    if (userAccount.role === 'worker' && workerProfile) {
      return <WorkerProfileView userProfile={userProfile} workerProfile={workerProfile} distance={distance} />;
    }

    if (userAccount.role === 'customer' && customerProfile) {
      return <CustomerProfileView userProfile={userProfile} customerProfile={customerProfile} />;
    }

    return (
        <Card>
            <CardHeader><CardTitle>Profile Incomplete</CardTitle></CardHeader>
            <CardContent><p>This user has not completed their profile yet.</p></CardContent>
        </Card>
    );
  };


  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <Header />
      <main className="container mx-auto max-w-4xl flex-1 py-8">
        {renderContent()}
      </main>
    </div>
  );
}


