'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button';
import { WorkBeeLogo } from '@/components/icons';
import {
  LayoutDashboard,
  User,
  Briefcase,
  Search,
  MessageSquare,
  LogOut,
  ShieldCheck,
  Settings,
} from 'lucide-react';

// A placeholder for user role
const userRole = 'customer'; // can be 'worker', 'customer', or 'admin'

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

export function AppSidebar() {
  const pathname = usePathname();
  const navItems = [...commonNavItems, ...(roleNavItems[userRole] || [])];

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                <Link
                href="/dashboard"
                className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                >
                    <WorkBeeLogo className="h-4 w-4 transition-all group-hover:scale-110" />
                    <span className="sr-only">E&F WorkBee</span>
                </Link>

                {navItems.map(item => (
                    <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                        <Link
                            href={item.href}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${pathname.startsWith(item.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="sr-only">{item.label}</span>
                        </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                ))}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href="#"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                        >
                            <Settings className="h-5 w-5" />
                            <span className="sr-only">Settings</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>
            </nav>
        </TooltipProvider>
    </aside>
  );
}
