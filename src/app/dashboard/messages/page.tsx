'use client';

import { useState } from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, Send } from 'lucide-react';
import { PriceProposalDialog } from '@/components/dashboard/price-proposal-dialog';
import { PriceProposalCard } from '@/components/dashboard/price-proposal-card';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';


export default function MessagesPage() {
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const { user } = useUser();

  // This is a mock message for demonstration. In a real app, this would come from Firestore.
  const mockProposalMessage: ChatMessage = {
    id: 'proposal1',
    conversationId: 'conv1',
    senderId: 'somebody-else', // Not the current user, so they can respond
    content: 'Installation of new kitchen sink and faucet.',
    createdAt: new Date().toISOString(),
    contentType: 'proposal',
    proposalAmount: 250,
    proposalStatus: 'pending',
  };

  const mockAcceptedProposal: ChatMessage = {
    ...mockProposalMessage,
    id: 'proposal2',
    senderId: user?.uid || 'me',
    proposalStatus: 'accepted'
  }


  return (
    <>
    <div className="grid h-[calc(100vh-8rem)] w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        <div className="hidden flex-col border-r bg-muted/40 md:flex">
            <CardHeader>
                <CardTitle>Messages</CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-auto">
                <nav className="grid items-start px-2 text-sm font-medium">
                    <div className="flex cursor-pointer items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://picsum.photos/seed/avatar1/40/40" alt="John Doe" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 truncate">
                            <div className="font-semibold">John Doe</div>
                            <div className="text-xs text-muted-foreground truncate">Fix Leaky Faucet</div>
                        </div>
                    </div>
                     <div className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://picsum.photos/seed/avatar2/40/40" alt="Jane Smith" />
                            <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 truncate">
                            <div className="font-semibold">Jane Smith</div>
                            <div className="text-xs text-muted-foreground truncate">You: Sounds good, see you then!</div>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
        <div className="flex flex-col md:col-span-2 lg:col-span-3">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                 <div className="flex items-center gap-2 font-semibold">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://picsum.photos/seed/avatar1/40/40" alt="John Doe" />
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <span>John Doe</span>
                </div>
            </header>
            <main className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                    <div className="flex items-end gap-2">
                        <div className="max-w-xs rounded-lg bg-primary p-3 text-primary-foreground">
                            <p>Hi, I saw your job post for the leaky faucet. I'm available to take a look tomorrow afternoon.</p>
                        </div>
                    </div>
                    <div className={cn("flex items-end gap-2 justify-end")}>
                         <div className={cn("max-w-xs rounded-lg p-3 bg-muted")}>
                            <p>That works for me. What time were you thinking?</p>
                        </div>
                    </div>

                    <PriceProposalCard message={mockProposalMessage} conversationId="conv1" />
                    <PriceProposalCard message={mockAcceptedProposal} conversationId="conv1" />

                </div>
            </main>
            <footer className="border-t bg-background px-4 py-3">
                <form className="flex w-full items-center space-x-2">
                    <Input
                    id="message"
                    placeholder="Type your message..."
                    className="flex-1"
                    autoComplete="off"
                    />
                    <Button type="button" variant="outline" className="whitespace-nowrap" onClick={() => setIsProposalOpen(true)}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Propose Price
                    </Button>
                    <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
                <p className="mt-2 text-xs text-center text-muted-foreground">
                    For your safety, all communication and payment must stay in the app.
                </p>
            </footer>
        </div>
    </div>
    <PriceProposalDialog isOpen={isProposalOpen} setIsOpen={setIsProposalOpen} conversationId="conv1" />
    </>
  );
}

    