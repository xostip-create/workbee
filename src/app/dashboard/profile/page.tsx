import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your account and profile settings.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="john.doe@example.com" disabled />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Input id="skills" defaultValue="Plumbing, Electrical, Carpentry" placeholder="e.g., Plumbing, Electrical" />
                    <p className="text-sm text-muted-foreground">For workers: add skills separated by commas.</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="bio">About Me</Label>
                    <Textarea id="bio" placeholder="Tell us a little about yourself" />
                </div>
                <Button>Update Profile</Button>
            </CardContent>
        </Card>
    </div>
  );
}
