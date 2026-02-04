'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useUser,
  useFirestore,
  useCollection,
  useDoc,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  getDocs,
  addDoc,
  increment,
} from 'firebase/firestore';
import type { Conversation, ChatMessage, UserProfile, Job } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { PriceProposalDialog } from '@/components/dashboard/price-proposal-dialog';
import { PriceProposalCard } from '@/components/dashboard/price-proposal-card';
import { PaymentCard } from '@/components/dashboard/payment-card';
import {
  MessageSquare,
  Send,
  X,
  Loader2,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

function ConversationListItem({
  conversation,
  onSelect,
  isActive,
  currentUserId,
}: {
  conversation: Conversation;
  onSelect: (id: string) => void;
  isActive: boolean;
  currentUserId: string;
}) {
  const firestore = useFirestore();
  const otherParticipantId = conversation.participantIds.find(
    (id) => id !== currentUserId
  );
  const userProfileRef = useMemoFirebase(
    () => (otherParticipantId ? doc(firestore, 'userProfiles', otherParticipantId) : null),
    [firestore, otherParticipantId]
  );
  const { data: otherUserProfile } = useDoc<UserProfile>(userProfileRef);
  const unreadCount = conversation.unreadCounts?.[currentUserId] || 0;

  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg p-2 text-muted-foreground transition-all hover:bg-accent',
        isActive ? 'bg-accent' : 'hover:text-foreground'
      )}
    >
      <Avatar className="h-10 w-10 border">
        <AvatarImage src={otherUserProfile?.profilePhoto} alt={otherUserProfile?.fullName} />
        <AvatarFallback>
          {otherUserProfile?.fullName?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 truncate">
        <div className="font-semibold text-foreground">{otherUserProfile?.fullName || '...'}</div>
        <p className="text-xs truncate">
          {conversation.lastMessage || 'No messages yet'}
        </p>
      </div>
      {unreadCount > 0 && (
        <Badge className="bg-red-500 text-white hover:bg-red-600">
          {unreadCount}
        </Badge>
      )}
    </div>
  );
}

function ChatView({ conversationId }: { conversationId: string }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState('');
    const [isProposalOpen, setIsProposalOpen] = useState(false);
    const chatContainerRef = React.useRef<HTMLDivElement>(null);
  
    const conversationRef = useMemoFirebase(() => doc(firestore, 'conversations', conversationId), [firestore, conversationId]);
    const { data: conversation } = useDoc<Conversation>(conversationRef);
  
    const otherParticipantId = useMemo(() => conversation?.participantIds.find((id) => id !== user?.uid), [conversation, user]);
  
    const messagesQuery = useMemoFirebase(() => query(collection(firestore, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc')), [firestore, conversationId]);
    const { data: messages, isLoading: isLoadingMessages } = useCollection<ChatMessage>(messagesQuery);
    
    const jobsInConversationQuery = useMemoFirebase(() => query(collection(firestore, 'jobs'), where('conversationId', '==', conversationId)), [firestore, conversationId]);
    const { data: jobs } = useCollection<Job>(jobsInConversationQuery);
    const jobsMap = useMemo(() => new Map(jobs?.map(j => [j.id, j])), [jobs]);
  
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !user || !otherParticipantId) return;
  
      addDocumentNonBlocking(collection(firestore, 'conversations', conversationId, 'messages'), {
        conversationId,
        senderId: user.uid,
        content: newMessage,
        createdAt: new Date().toISOString(),
        contentType: 'text',
      });
  
      const convoUpdate: any = {
        lastMessage: newMessage,
        updatedAt: new Date().toISOString(),
      };
      convoUpdate[`unreadCounts.${otherParticipantId}`] = increment(1);
      updateDocumentNonBlocking(conversationRef, convoUpdate);
  
      setNewMessage('');
    };
  
    return (
      <>
        <div className="flex h-full flex-col">
          <main className="flex-1 overflow-auto p-4" ref={chatContainerRef}>
              {isLoadingMessages ? (
                  <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>
              ) : (
                  <div className="space-y-4">
                      {messages?.map((message) => {
                          if (message.contentType === 'proposal') {
                              const job = message.jobId ? jobsMap.get(message.jobId) : undefined;
                              if (job) return <PaymentCard key={job.id} job={job} />;
                              return <PriceProposalCard key={message.id} message={message} conversationId={conversationId} />;
                          }
                          return (
                              <div key={message.id} className={cn("flex items-end gap-2", message.senderId === user?.uid && "justify-end")}>
                                  <div className={cn("max-w-xs rounded-lg p-3", message.senderId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                      <p className="whitespace-pre-wrap">{message.content}</p>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              )}
          </main>
          <footer className="border-t bg-background px-4 py-3">
            <form className="flex w-full items-center space-x-2" onSubmit={handleSendMessage}>
              <Input id="message" placeholder="Type your message..." className="flex-1" autoComplete="off" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
              <Button type="button" size="sm" variant="outline" onClick={() => setIsProposalOpen(true)}><DollarSign className="h-4 w-4" /></Button>
              <Button type="submit" size="icon" disabled={!newMessage.trim()}><Send className="h-4 w-4" /></Button>
            </form>
          </footer>
        </div>
        <PriceProposalDialog isOpen={isProposalOpen} setIsOpen={setIsProposalOpen} conversationId={conversationId} />
      </>
    );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();


  // FIX: Remove orderBy to prevent missing index error. Sorting is now done on the client.
  const conversationsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'conversations'), where('participantIds', 'array-contains', user.uid)) : null),
    [user, firestore]
  );
  const { data: conversations, isLoading } = useCollection<Conversation>(conversationsQuery);

  // Sort conversations on the client-side since orderBy was removed from the query
  const sortedConversations = useMemo(() => {
    if (!conversations) return [];
    return [...conversations].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [conversations]);


  const totalUnreadCount = useMemo(() => {
    if (!sortedConversations || !user) return 0;
    return sortedConversations.reduce((sum, convo) => sum + (convo.unreadCounts?.[user.uid] || 0), 0);
  }, [sortedConversations, user]);

  const selectedConversation = useMemo(() => {
    return sortedConversations?.find(c => c.id === selectedConversationId);
  }, [sortedConversations, selectedConversationId]);

  const otherParticipantId = useMemo(() => {
    if (!selectedConversation || !user) return null;
    return selectedConversation.participantIds.find(id => id !== user.uid);
  }, [selectedConversation, user]);

  const { data: otherUserProfile } = useDoc<UserProfile>(useMemoFirebase(() => otherParticipantId ? doc(firestore, 'userProfiles', otherParticipantId) : null, [firestore, otherParticipantId]));

  useEffect(() => {
    const handleUrlTrigger = async () => {
      // Use original `conversations` to check loading state, not the sorted one
      if (!user || !firestore || conversations === null) return;
      
      const otherUserId = searchParams.get('to');
      const openChat = searchParams.get('openChat');

      // Only proceed if there's a trigger param
      if (!otherUserId && !openChat) return;

      // Clean the URL params by replacing the current history entry.
      router.replace(window.location.pathname, { scroll: false });

      if (otherUserId) {
          const existingConvo = conversations.find(c => c.participantIds.includes(otherUserId));

          if (existingConvo) {
            setSelectedConversationId(existingConvo.id);
          } else {
            const newConversationRef = await addDoc(collection(firestore, 'conversations'), {
              participantIds: [user.uid, otherUserId].sort(),
              updatedAt: new Date().toISOString(),
              lastMessage: '',
              unreadCounts: { [user.uid]: 0, [otherUserId]: 0 },
            });
            setSelectedConversationId(newConversationRef.id);
          }
      }
      
      if (openChat && !otherUserId) {
          // If just opening chat, ensure no conversation is selected
          // so user sees the conversation list.
          setSelectedConversationId(null);
      }

      setIsOpen(true);
    };

    if (user && conversations !== null) {
      handleUrlTrigger();
    }
  }, [user, firestore, conversations, searchParams, router]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    const conversation = sortedConversations?.find((c) => c.id === id);
    if (user?.uid && conversation) {
      const unreadCount = conversation.unreadCounts?.[user.uid] || 0;
      if (unreadCount > 0) {
        const conversationRef = doc(firestore, 'conversations', id);
        updateDocumentNonBlocking(conversationRef, { [`unreadCounts.${user.uid}`]: 0 });
      }
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsOpen(!isOpen)} size="icon" className="h-14 w-14 rounded-full shadow-lg">
          {isOpen ? <X /> : <MessageSquare />}
          {totalUnreadCount > 0 && !isOpen && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 justify-center rounded-full bg-red-500 p-0 text-white">{totalUnreadCount}</Badge>
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[70vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-lg border bg-card shadow-2xl">
          <header className="flex shrink-0 items-center gap-2 border-b p-3">
            {selectedConversationId && (
              <Button variant="ghost" size="icon" className="-ml-1" onClick={() => setSelectedConversationId(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex-1">
                {selectedConversationId ? (
                     <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={otherUserProfile?.profilePhoto} />
                            <AvatarFallback>{otherUserProfile?.fullName?.[0]}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold">{otherUserProfile?.fullName}</h3>
                     </div>
                ) : (
                    <h3 className="font-semibold text-lg">Messages</h3>
                )}
            </div>
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
            </Button>
          </header>

          {!selectedConversationId ? (
            <div className="flex-1 overflow-y-auto">
              <nav className="grid gap-1 p-2">
                {isLoading ? (
                  <Loader2 className="mx-auto my-4 animate-spin" />
                ) : sortedConversations && sortedConversations.length > 0 ? (
                  sortedConversations.map((convo) => (
                    <ConversationListItem
                      key={convo.id}
                      conversation={convo}
                      onSelect={handleSelectConversation}
                      isActive={selectedConversationId === convo.id}
                      currentUserId={user!.uid}
                    />
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">No conversations yet.</div>
                )}
              </nav>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
                <ChatView conversationId={selectedConversationId} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
