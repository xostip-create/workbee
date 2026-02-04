'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { WorkBeeLogo } from '@/components/icons';
import {
  LayoutDashboard,
  User,
  Briefcase,
  Search,
  MessageSquare,
  ShieldCheck,
  Settings,
  Loader2,
} from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserAccount } from '@/types';
import { cn } from '@/lib/utils';


const commonNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
];

const roleNavItems = {
  worker: [{ href: '/dashboard/jobs', label: 'Available Jobs', icon: Briefcase }],
  customer: [
    { href: '/dashboard/jobs', label: 'My Jobs', icon: Briefcase },
    { href: '/dashboard/search', label: 'Search Workers', icon: Search },
  ],
  admin: [{ href: '/admin', label: 'Approvals', icon: ShieldCheck }],
};

export function AppSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  const userAccountRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'userAccounts', user.uid);
  }, [firestore, user]);

  const { data: userAccount, isLoading } = useDoc<UserAccount>(userAccountRef);

  const userRole = userAccount?.role || 'customer';
  const navItems = [...commonNavItems, ...(roleNavItems[userRole] || [])]
    .filter(item => {
      // Hide messages for admin
      if (userRole === 'admin' && item.href === '/dashboard/messages') {
        return false;
      }
      // Hide the redundant dashboard link for admin, since they have the /admin link
      if (userRole === 'admin' && item.href === '/dashboard') {
        return false;
      }
      return true;
    });


  const sidebarContent = (
    <>
      <nav className={cn("flex flex-col items-center gap-4 px-2", isMobile ? "p-4" : "sm:py-5")}>
          <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
              <WorkBeeLogo className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">E&F WorkBee</span>
          </Link>

          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : navItems.map(item => (
            <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                <Link
                    href={item.href}
                    className={cn(
                        `flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8`,
                        pathname.startsWith(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground',
                        isMobile && "w-full justify-start h-auto p-2"
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {isMobile ? <span className="ml-2">{item.label}</span> : <span className="sr-only">{item.label}</span>}
                </Link>
                </TooltipTrigger>
                {!isMobile && <TooltipContent side="right">{item.label}</TooltipContent>}
            </Tooltip>
        ))}
      </nav>
      <nav className={cn("mt-auto flex flex-col items-center gap-4 px-2", isMobile ? "p-4" : "sm:py-5")}>
          <Tooltip>
              <TooltipTrigger asChild>
                  <Link
                      href="#"
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                        isMobile && "w-full justify-start h-auto p-2"
                      )}
                  >
                      <Settings className="h-5 w-5" />
                      {isMobile ? <span className="ml-2">Settings</span> : <span className="sr-only">Settings</span>}
                  </Link>
              </TooltipTrigger>
              {!isMobile && <TooltipContent side="right">Settings</TooltipContent>}
          </Tooltip>
      </nav>
    </>
  );

  if (isMobile) {
    return (
        <div className="flex h-full flex-col">
            {sidebarContent}
        </div>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
            {sidebarContent}
        </TooltipProvider>
    </aside>
  );
}
