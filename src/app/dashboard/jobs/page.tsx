import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { jobs } from '@/lib/placeholder-data';

export default function JobsPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Jobs</h1>
                <p className="text-muted-foreground">View and manage your job postings.</p>
            </div>
            <Button>Post a New Job</Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Job History</CardTitle>
                <CardDescription>A list of your recent job postings.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.map(job => (
                            <TableRow key={job.id}>
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell><Badge variant={job.status === 'Open' ? 'default' : job.status === 'Completed' ? 'secondary' : 'outline'}>{job.status}</Badge></TableCell>
                                <TableCell>${job.budget.toLocaleString()}</TableCell>
                                <TableCell>{job.location}</TableCell>
                                <TableCell><Button variant="outline" size="sm">View</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
