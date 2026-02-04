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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { UserAccount } from '@/types';
import { Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatDistanceToNow } from 'date-fns';


function UserActions({ user }: { user: UserAccount }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleStatusChange = (status: 'Suspended' | 'Blocked' | 'Approved') => {
        if (user.role !== 'worker') {
            toast({ variant: 'destructive', title: 'Action not applicable for this user role.' });
            return;
        }
        const workerProfileRef = doc(firestore, 'workerProfiles', user.id);
        updateDocumentNonBlocking(workerProfileRef, { status });
        toast({ title: 'Worker Status Updated', description: `Worker has been ${status.toLowerCase()}.` });
    };

    const handleDeleteUser = () => {
        // This is a destructive action.
        // It deletes the user's main account, their profile, and their role-specific profile.
        const userAccountRef = doc(firestore, 'userAccounts', user.id);
        const userProfileRef = doc(firestore, 'userProfiles', user.id);
        
        deleteDocumentNonBlocking(userAccountRef);
        deleteDocumentNonBlocking(userProfileRef);

        if (user.role === 'worker') {
            const workerProfileRef = doc(firestore, 'workerProfiles', user.id);
            deleteDocumentNonBlocking(workerProfileRef);
        } else if (user.role === 'customer') {
            const customerProfileRef = doc(firestore, 'customerProfiles', user.id);
            deleteDocumentNonBlocking(customerProfileRef);
        }

        toast({ variant: 'destructive', title: 'User Deleted', description: `User ${user.email} has been permanently deleted.` });
    };

    return (
        <>
            <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild><a href={`/profile/${user.id}`} target="_blank" rel="noopener noreferrer">View Profile</a></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.role === 'worker' && (
                            <>
                                <DropdownMenuItem onClick={() => handleStatusChange('Suspended')}>Suspend Worker</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange('Blocked')} className="text-destructive focus:bg-destructive/10 focus:text-destructive">Block Worker</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange('Approved')}>Re-Approve Worker</DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                           <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" /> Delete User
                           </DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user's account and all associated data from the servers.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default function UsersPage() {
    const firestore = useFirestore();
    const allUsersQuery = useMemoFirebase(() => collection(firestore, 'userAccounts'), [firestore]);
    const { data: users, isLoading } = useCollection<UserAccount>(allUsersQuery);

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">View, manage, and moderate all platform users.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A list of all registered users on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Date Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : users && users.length > 0 ? (
                                users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell><Badge variant="outline" className="capitalize">{user.role}</Badge></TableCell>
                                        <TableCell>
                                            {user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <UserActions user={user} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10">
                                        <h3 className="font-semibold">No users found</h3>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
