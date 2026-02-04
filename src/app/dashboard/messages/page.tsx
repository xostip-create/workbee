'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useUser,
  useFirestore,
  useCollection,
  useDoc,
  useMemoFirebase,
  addDocumentNonBlocking,
} from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  addDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import type {
  Conversation,
  ChatMessage,
  UserProfile,
  Job,
} from '@/types';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2, Send, MessageSquare } from 'lucide-react';
import { PriceProposalDialog } from '@/components/dashboard/price-proposal-dialog';
import { PriceProposalCard } from '@/components/dashboard/price-proposal-card';
import { PaymentCard } from '@/components/dashboard/payment-card';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

function ConversationListItem({
  conversation,
  onSelect,
  isActive,
}: {
  conversation: Conversation;
  onSelect: (id: string) => void;
  isActive: boolean;
}) {
  const { user } = useUser();
  const firestore = useFirestore();

  const otherParticipantId = useMemo(() => {
    return conversation.participantIds.find((id) => id !== user?.uid);
  }, [conversation.participantIds, user]);

  const userProfileRef = useMemoFirebase(
    () => (otherParticipantId ? doc(firestore, 'userProfiles', otherParticipantId) : null),
    [firestore, otherParticipantId]
  );
  const { data: otherUserProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
        isActive && 'bg-muted text-primary'
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={otherUserProfile?.profilePhoto} alt={otherUserProfile?.fullName} />
        <AvatarFallback>
          {isLoading ? <Loader2 className="animate-spin" /> : otherUserProfile?.fullName?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 truncate">
        <div className="font-semibold">{otherUserProfile?.fullName || '...'}</div>
        <div className="text-xs text-muted-foreground truncate">{conversation.lastMessage || 'No messages yet'}</div>
      </div>
    </div>
  );
}

function ChatView({ conversationId }: { conversationId: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const conversationRef = useMemoFirebase(() => doc(firestore, 'conversations', conversationId), [firestore, conversationId]);
  const { data: conversation } = useDoc<Conversation>(conversationRef);

  const otherParticipantId = useMemo(() => {
    return conversation?.participantIds.find((id) => id !== user?.uid);
  }, [conversation, user]);

  const otherUserProfileRef = useMemoFirebase(
    () => (otherParticipantId ? doc(firestore, 'userProfiles', otherParticipantId) : null),
    [firestore, otherParticipantId]
  );
  const { data: otherUserProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(otherUserProfileRef);

  const messagesQuery = useMemoFirebase(
    () => query(collection(firestore, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc')),
    [firestore, conversationId]
  );
  const { data: messages, isLoading: isLoadingMessages } = useCollection<ChatMessage>(messagesQuery);
  
  const jobsInConversationQuery = useMemoFirebase(() => query(collection(firestore, 'jobs'), where('conversationId', '==', conversationId)), [firestore, conversationId]);
  const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsInConversationQuery);

  const jobsMap = useMemo(() => new Map(jobs?.map(j => [j.id, j])), [jobs]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
    addDocumentNonBlocking(messagesRef, {
      conversationId,
      senderId: user.uid,
      content: newMessage,
      createdAt: new Date().toISOString(),
      contentType: 'text',
    });
    setNewMessage('');
  };

  if (isLoadingProfile) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>
  }

  return (
    <>
    <div className="flex flex-col h-full">
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherUserProfile?.profilePhoto} alt={otherUserProfile?.fullName} />
            <AvatarFallback>{otherUserProfile?.fullName?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <span>{otherUserProfile?.fullName}</span>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {messages?.map((message) => {
               if (message.contentType === 'proposal') {
                   const job = message.jobId ? jobsMap.get(message.jobId) : undefined;
                   // If a job exists from this proposal, show the payment card instead of the proposal card.
                   if (job) {
                       return <PaymentCard key={job.id} job={job} />
                   }
                   return <PriceProposalCard key={message.id} message={message} conversationId={conversationId} />
               }
               // Normal text message
               return (
                <div key={message.id} className={cn("flex items-end gap-2", message.senderId === user?.uid && "justify-end")}>
                  <div className={cn("max-w-xs rounded-lg p-3", message.senderId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <p>{message.content}</p>
                  </div>
                </div>
               )
            })}
          </div>
        )}
      </main>
      <footer className="border-t bg-background px-4 py-3">
        <form className="flex w-full items-center space-x-2" onSubmit={handleSendMessage}>
          <Input
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="button" variant="outline" className="whitespace-nowrap" onClick={() => setIsProposalOpen(true)}>
            <DollarSign className="mr-2 h-4 w-4" />
            Propose Price
          </Button>
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
        <p className="mt-2 text-xs text-center text-muted-foreground">
          For your safety, all communication and payment must stay in the app.
        </p>
      </footer>
    </div>
    <PriceProposalDialog isOpen={isProposalOpen} setIsOpen={setIsProposalOpen} conversationId={conversationId} />
    </>
  );
}

function MessagesPageContent() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const otherUserId = searchParams.get('to');

  const conversationsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'conversations'), where('participantIds', 'array-contains', user.uid), orderBy('updatedAt', 'desc')) : null),
    [user, firestore]
  );
  const { data: conversations, isLoading } = useCollection<Conversation>(conversationsQuery);
  
  useEffect(() => {
    const findOrCreateConversation = async () => {
      if (!user || !firestore || !otherUserId) return;

      const q = query(collection(firestore, 'conversations'), where('participantIds', 'array-contains', user.uid));
      const querySnapshot = await getDocs(q);
      const existingConversation = querySnapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as Conversation))
        .find(c => c.participantIds.includes(otherUserId));

      if (existingConversation) {
        setSelectedConversationId(existingConversation.id);
      } else {
        const newConversationRef = await addDoc(collection(firestore, 'conversations'), {
          participantIds: [user.uid, otherUserId].sort(),
          updatedAt: new Date().toISOString(),
          lastMessage: '',
        });
        setSelectedConversationId(newConversationRef.id);
      }
      router.replace('/dashboard/messages', { scroll: false });
    };

    if (otherUserId) {
      findOrCreateConversation();
    }
  }, [otherUserId, user, firestore, router]);


  return (
    <div className="grid h-[calc(100vh-8rem)] w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
      <div className="hidden flex-col border-r bg-muted/40 md:flex">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <div className="flex-1 overflow-auto">
          <nav className="grid items-start px-2 text-sm font-medium">
            {isLoading && <Loader2 className="mx-auto my-4 animate-spin" />}
            {conversations && conversations.map((convo) => (
              <ConversationListItem
                key={convo.id}
                conversation={convo}
                onSelect={setSelectedConversationId}
                isActive={selectedConversationId === convo.id}
              />
            ))}
             {conversations?.length === 0 && !isLoading && (
                 <div className="text-center text-muted-foreground p-4">No conversations yet.</div>
             )}
          </nav>
        </div>
      </div>
      <div className="flex flex-col md:col-span-2 lg:col-span-3">
        {selectedConversationId ? (
          <ChatView conversationId={selectedConversationId} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
             <MessageSquare className="h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No Conversation Selected</h3>
            <p className="max-w-xs">Select a conversation from the list to view messages, or start a new one by messaging a worker.</p>
          </div>
        )}
      </div>
    </div>
  );
}


export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <MessagesPageContent />
        </Suspense>
    )
}
