import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AppSidebar />
        <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <DashboardHeader />
            <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
