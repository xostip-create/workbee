'use client';

import type { Job } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PaystackButton } from '@/components/paystack/paystack-button';
import { Button } from '../ui/button';
import { CheckCircle2, Phone } from 'lucide-react';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface PaymentCardProps {
    job: Job;
    otherPartyPhoneNumber?: string; 
}

export function PaymentCard({ job, otherPartyPhoneNumber }: PaymentCardProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    if (!job) return null;
    
    // Only the customer should see the payment button
    const isCustomer = user?.uid === job.customerId;

    const handleMarkAsCompleted = () => {
        const jobRef = doc(firestore, 'jobs', job.id);
        updateDocumentNonBlocking(jobRef, { status: 'Completed', completedAt: new Date().toISOString() });
        toast({ title: 'Job Marked as Completed', description: 'Thank you for using E&F WorkBee.' });
    };

    if (job.status === 'AwaitingPayment' && isCustomer) {
        return (
            <Card className="max-w-sm mx-auto">
                <CardHeader>
                    <CardTitle>Finalize Payment</CardTitle>
                    <CardDescription>Secure the payment to begin the job.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Job Price</span>
                            <span>₦{job.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Service Fee (10%)</span>
                            <span>₦{job.serviceFee.toLocaleString()}</span>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₦{job.totalAmount.toLocaleString()}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <PaystackButton job={job} />
                </CardFooter>
            </Card>
        );
    }
    
    if (job.status === 'PaymentSecured') {
        return (
             <Card className="max-w-sm mx-auto bg-green-50 border-green-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <CardTitle className="text-green-800">Payment Secured!</CardTitle>
                    </div>
                    <CardDescription className="text-green-700">The job can now begin. You can now contact the other party directly.</CardDescription>
                </CardHeader>
                {isCustomer && (
                    <CardFooter>
                         <Button variant="outline" className="w-full" onClick={handleMarkAsCompleted}>Mark as Completed</Button>
                    </CardFooter>
                )}
            </Card>
        )
    }

    if (job.status === 'Completed') {
         return (
             <Card className="max-w-sm mx-auto">
                <CardHeader className="items-center text-center">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                    <CardTitle>Job Completed</CardTitle>
                </CardHeader>
             </Card>
        )
    }

    return null;
}
