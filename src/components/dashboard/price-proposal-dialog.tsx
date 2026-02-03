'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const proposalSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive."),
  description: z.string().min(1, "Description is required.").max(500),
});

interface PriceProposalDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  conversationId: string;
}

export function PriceProposalDialog({ isOpen, setIsOpen, conversationId }: PriceProposalDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof proposalSchema>>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      amount: 0,
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof proposalSchema>) {
    if (!user || !conversationId) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to send a proposal.' });
        return;
    }
    
    setIsSubmitting(true);

    const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
    
    addDocumentNonBlocking(messagesRef, {
        conversationId,
        senderId: user.uid,
        contentType: 'proposal',
        content: values.description,
        proposalAmount: values.amount,
        proposalStatus: 'pending',
        createdAt: new Date().toISOString(), // Using client time for simplicity
    });

    toast({ title: 'Proposal Sent', description: 'Your price proposal has been sent to the other party.' });
    setIsSubmitting(false);
    setIsOpen(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Propose a Price</DialogTitle>
          <DialogDescription>
            Enter the amount and a short description for the job or service. This will be sent to the other party for approval.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount (₦)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 5000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Job Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., Fix leaking kitchen sink and replace faucet." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Proposal
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
    