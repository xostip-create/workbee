'use client';

import type { ChatMessage } from '@/types';
import { useUser, useFirestore, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Check, X, ArrowRightLeft } from 'lucide-react';

interface PriceProposalCardProps {
    message: ChatMessage;
    conversationId: string;
}

export function PriceProposalCard({ message, conversationId }: PriceProposalCardProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    if (message.contentType !== 'proposal' || message.proposalStatus === 'accepted') return null;

    const isReceiver = user?.uid && message.senderId !== user.uid;
    const canRespond = isReceiver && message.proposalStatus === 'pending';

    const handleResponse = (status: 'accepted' | 'rejected' | 'countered') => {
        if (!conversationId || !message.id || !user) return;

        if (status === 'accepted') {
            const jobRef = doc(firestore, 'jobs', message.id);
            const price = message.proposalAmount || 0;
            const serviceFee = price * 0.10; // 10% service fee
            const totalAmount = price + serviceFee;

            // The user accepting is the customer, the sender of the proposal is the worker
            const jobData = {
                id: message.id,
                customerId: user.uid, // The one who accepts
                workerId: message.senderId, // The one who proposed
                conversationId,
                description: message.content,
                price,
                serviceFee,
                totalAmount,
                status: 'AwaitingPayment',
                createdAt: new Date().toISOString(),
            };

            // Create Job doc
            setDocumentNonBlocking(jobRef, jobData, { merge: true });

            // Update message
            const messageRef = doc(firestore, 'conversations', conversationId, 'messages', message.id);
            updateDocumentNonBlocking(messageRef, { 
                proposalStatus: 'accepted',
                jobId: message.id
            });

            toast({ title: 'Proposal Accepted', description: 'Proceed to payment.' });

        } else {
            const messageRef = doc(firestore, 'conversations', conversationId, 'messages', message.id);
            updateDocumentNonBlocking(messageRef, { proposalStatus: status });
            toast({ title: `Proposal ${status.charAt(0).toUpperCase() + status.slice(1)}` });
        }
    };

    const getStatusBadge = () => {
        switch (message.proposalStatus) {
            case 'accepted':
                return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Accepted</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            case 'countered':
                return <Badge variant="secondary">Countered</Badge>;
            case 'pending':
            default:
                return <Badge variant="outline">Pending</Badge>;
        }
    };

    return (
        <div className={cn("flex w-full", message.senderId === user?.uid ? "justify-end" : "justify-start")}>
            <Card className="max-w-sm w-full">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Price Proposal</CardTitle>
                        {getStatusBadge()}
                    </div>
                    <CardDescription>
                        {message.senderId === user?.uid ? "You proposed:" : "Proposal from other party:"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-center mb-2">₦{message.proposalAmount?.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground text-center">{message.content}</p>
                </CardContent>
                {canRespond && (
                    <CardFooter className="grid grid-cols-3 gap-2">
                        <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleResponse('rejected')}>
                            <X className="mr-2 h-4 w-4"/> Reject
                        </Button>
                         <Button variant="outline" onClick={() => handleResponse('countered')}>
                            <ArrowRightLeft className="mr-2 h-4 w-4"/> Counter
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleResponse('accepted')}>
                            <Check className="mr-2 h-4 w-4"/> Accept
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
