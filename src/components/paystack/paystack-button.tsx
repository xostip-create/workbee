'use client';

import { usePaystackPayment } from 'react-paystack';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import type { Job } from '@/types';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface PaystackButtonProps {
    job: Job;
}

// IMPORTANT: Replace with your public key in your environment variables
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

export function PaystackButton({ job }: PaystackButtonProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const config = {
        reference: new Date().getTime().toString(),
        email: user?.email!,
        amount: job.totalAmount * 100, // Amount in kobo
        publicKey: PAYSTACK_PUBLIC_KEY,
    };

    const initializePayment = usePaystackPayment(config);

    const onSuccess = () => {
        const jobRef = doc(firestore, 'jobs', job.id);
        updateDocumentNonBlocking(jobRef, { 
            status: 'PaymentSecured',
            paidAt: new Date().toISOString()
        });
        toast({
            title: "Payment Successful!",
            description: "The job can now begin.",
        });
    };

    const onClose = () => {
        // This is called when the user closes the payment popup.
        // You can optionally show a toast message here.
    };
    
    if (!user || !PAYSTACK_PUBLIC_KEY) {
        return (
            <div className="text-center text-red-500 text-sm p-4 bg-red-50 rounded-md">
                <p className='font-bold'>Paystack Not Configured</p>
                <p>Please add your Paystack public key to a `.env.local` file as `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` to enable payments.</p>
            </div>
        )
    }

    return (
        <Button 
            className="w-full" 
            onClick={() => initializePayment({onSuccess, onClose})}
            disabled={!user}
        >
            Pay ₦{job.totalAmount.toLocaleString()} with Paystack
        </Button>
    );
}
