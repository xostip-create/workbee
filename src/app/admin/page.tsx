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
  import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
  import { collection, doc, query, where } from 'firebase/firestore';
  import type { WorkerProfile, UserProfile } from '@/types';
  import { Loader2 } from 'lucide-react';
  import { toast } from '@/hooks/use-toast';
  
  export default function AdminPage() {
    const firestore = useFirestore();

    const pendingWorkersQuery = useMemoFirebase(() => {
        return query(collection(firestore, 'workerProfiles'), where('status', '==', 'Pending Approval'));
    }, [firestore]);

    const { data: pendingUsers, isLoading } = useCollection<WorkerProfile>(pendingWorkersQuery);

    const handleApproval = (workerId: string, newStatus: 'Approved' | 'Blocked') => {
        const workerDocRef = doc(firestore, 'workerProfiles', workerId);
        updateDocumentNonBlocking(workerDocRef, { status: newStatus });
        toast({
            title: `User ${newStatus}`,
            description: `The user has been ${newStatus.toLowerCase()}.`,
        });
    };
  
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Approvals</h1>
          <p className="text-muted-foreground">Review and approve new user registrations.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Pending Workers</CardTitle>
            <CardDescription>
              The following workers are waiting for verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
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
      </div>
    );
  }
  