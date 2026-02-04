'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile, WorkerProfile } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Loader2, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  skills: z.string().optional(),
  availability: z.string().optional(),
  bio: z.string().optional(),
  videoUrl: z.string().url({ message: "Please enter a valid YouTube URL." }).optional().or(z.literal('')),
});

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'userProfiles', user.uid) : null, [firestore, user]);
  const workerProfileRef = useMemoFirebase(() => user ? doc(firestore, 'workerProfiles', user.uid) : null, [firestore, user]);
  
  const { data: userProfile, isLoading: isLoadingUser } = useDoc<UserProfile>(userProfileRef);
  const { data: workerProfile, isLoading: isLoadingWorker } = useDoc<WorkerProfile>(workerProfileRef);

  const [isLocating, setIsLocating] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      skills: '',
      availability: '',
      bio: '',
      videoUrl: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.setValue('fullName', userProfile.fullName);
      form.setValue('bio', userProfile.bio || '');
    }
    if (workerProfile) {
        form.setValue('skills', workerProfile.skillCategoryIds?.join(', '));
        form.setValue('availability', workerProfile.availability);
        form.setValue('videoUrl', workerProfile.videoUrl || '');
    }
  }, [userProfile, workerProfile, form]);

  const handleLocation = () => {
    if (!navigator.geolocation) {
        toast({ variant: "destructive", title: "Geolocation is not supported by your browser." });
        return;
    }
    
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (userProfileRef) {
            // In a real app, you might use a reverse geocoding service here.
            const address = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
            updateDocumentNonBlocking(userProfileRef, { 
                locationLatitude: latitude, 
                locationLongitude: longitude,
                address: address
            });
            toast({ title: "Location Updated" });
        }
        setIsLocating(false);
      },
      () => {
        toast({ variant: "destructive", title: "Unable to retrieve your location." });
        setIsLocating(false);
      }
    );
  };

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    if (!user) return;

    // Update UserProfile
    if (userProfileRef) {
        updateDocumentNonBlocking(userProfileRef, { fullName: values.fullName, bio: values.bio });
    }

    // Update WorkerProfile if it exists
    if (workerProfileRef && workerProfile) {
        updateDocumentNonBlocking(workerProfileRef, {
            skillCategoryIds: values.skills?.split(',').map(s => s.trim()).filter(Boolean) || [],
            availability: values.availability,
            videoUrl: values.videoUrl || "",
        });
    }

    toast({
      title: "Profile Updated",
      description: "Your information has been saved.",
    });
  };

  const isLoading = isLoadingUser || isLoadingWorker;

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /></div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your account and profile settings.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <div className="flex items-center gap-2">
                            <Input id="address" value={userProfile?.address || "No location set"} disabled />
                            <Button type="button" variant="outline" size="icon" onClick={handleLocation} disabled={isLocating}>
                                {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                                <span className="sr-only">Get Current Location</span>
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">Use your current location to appear in searches.</p>
                    </div>
                    
                    {workerProfile && (
                        <>
                            <FormField
                                control={form.control}
                                name="skills"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Skills</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            {...field} 
                                            placeholder="Plumbing, Electrical, Painting, etc." 
                                            className="min-h-[100px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-sm text-muted-foreground">Enter each skill separated by a comma.</p>
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="availability"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Availability</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your availability" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Full-time (Weekdays)">Full-time (Weekdays)</SelectItem>
                                            <SelectItem value="Part-time (Weekends)">Part-time (Weekends)</SelectItem>
                                            <SelectItem value="Part-time (Evenings)">Part-time (Evenings)</SelectItem>
                                            <SelectItem value="Flexible">Flexible</SelectItem>
                                            <SelectItem value="Available on demand">Available on demand</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="videoUrl"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>YouTube Showcase Video</FormLabel>
                                    <FormControl><Input {...field} placeholder="https://www.youtube.com/watch?v=..."/></FormControl>
                                    <FormMessage />
                                    <p className="text-sm text-muted-foreground">Paste a link to a YouTube video to showcase your work.</p>
                                </FormItem>
                                )}
                            />
                        </>
                    )}

                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>About Me</FormLabel>
                            <FormControl><Textarea {...field} placeholder="Tell us a little about yourself" /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Profile
                    </Button>
                </CardContent>
            </Card>
          </form>
        </Form>
    </div>
  );
}
