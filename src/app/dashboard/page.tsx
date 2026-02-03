import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import {
    DollarSign,
    Users,
    Activity,
    AlertCircle,
    Briefcase,
  } from 'lucide-react';
  import Link from 'next/link';
  import { Button } from '@/components/ui/button';
  import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// In a real app, you'd get the user from a session.
const userRole = 'customer'; // 'worker', 'customer', or 'admin'
const userStatus = 'active'; // 'pending_verification'

const WorkerDashboard = () => (
    <>
      {userStatus === 'pending_verification' && (
        <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification Pending</AlertTitle>
            <AlertDescription>
                Your profile is under review. We'll notify you once it's approved. You can complete your profile details in the meantime.
            </AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">$1,235.00</div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+12</div>
                <p className="text-xs text-muted-foreground">+5 since last month</p>
            </CardContent>
        </Card>
      </div>
    </>
);
  
const CustomerDashboard = () => (
    <>
      <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Button asChild>
            <Link href="/dashboard/jobs">Post a New Job</Link>
          </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">$4,250.00</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">1 waiting for quotes</p>
            </CardContent>
        </Card>
      </div>
    </>
);

const AdminDashboard = () => (
    <>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">New users waiting for verification</p>
                    <Button size="sm" className="mt-2" asChild>
                        <Link href="/admin">Review Now</Link>
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,254</div>
                    <p className="text-xs text-muted-foreground">+50 this month</p>
                </CardContent>
            </Card>
        </div>
    </>
);
  
export default function DashboardPage() {
    let content;
    switch (userRole) {
      case 'worker':
        content = <WorkerDashboard />;
        break;
      case 'customer':
        content = <CustomerDashboard />;
        break;
      case 'admin':
        content = <AdminDashboard />;
        break;
      default:
        content = <p>Welcome to your dashboard.</p>;
    }
  
    return (
      <div className="space-y-4">
        {content}
      </div>
    );
}
