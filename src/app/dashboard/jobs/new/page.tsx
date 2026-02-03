'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUser, useFirestore, useDoc, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/types';

const jobPostingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  skills: z.string().min(1, 'Please list at least one skill.'),
  jobType: z.enum(['one-time', 'recurring', 'errand'], {
    required_error: 'You must select a job type.',
  }),
});

export default function NewJobPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'userProfiles', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<z.infer<typeof jobPostingSchema>>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: '',
      description: '',
      skills: '',
      jobType: 'one-time',
    },
  });

  async function onSubmit(values: z.infer<typeof jobPostingSchema>) {
    if (!user || !userProfile) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not find user profile.' });
      return;
    }
    
    const jobPostingsRef = collection(firestore, 'jobPostings');

    // Use addDocumentNonBlocking and let Firestore generate the ID
    const newDocPromise = addDocumentNonBlocking(jobPostingsRef, {
        customerId: user.uid,
        title: values.title,
        description: values.description,
        skillCategoryIds: values.skills.split(',').map(s => s.trim()).filter(Boolean),
        jobType: values.jobType,
        locationLatitude: userProfile.locationLatitude || null,
        locationLongitude: userProfile.locationLongitude || null,
        address: userProfile.address || 'No location set',
        status: 'open',
        createdAt: new Date().toISOString(),
    });

    // We can get the new doc's ID if we await the promise
    newDocPromise.then(docRef => {
        if(docRef) {
            // If you need to do something with the ID, like redirecting to the new job page
            // For now, we'll just redirect to the jobs list
        }
    });

    toast({
      title: 'Job Posted Successfully!',
      description: 'Your job is now visible to approved workers.',
    });
    router.push('/dashboard/jobs');
  }

  if (isLoadingProfile) {
      return <div className="flex justify-center items-center"><Loader2 className="animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post a New Job</h1>
        <p className="text-muted-foreground">
          Fill out the details below to find the perfect worker for your needs.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                Provide as much detail as possible. Your location from your profile will be used.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Install a new ceiling fan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the work to be done, any specific requirements, etc."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Electrical, Plumbing, Painting" {...field} />
                    </FormControl>
                     <p className="text-sm text-muted-foreground">Enter skills separated by a comma.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Job Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="one-time" />
                          </FormControl>
                          <FormLabel className="font-normal">One-time Job</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="recurring" />
                          </FormControl>
                          <FormLabel className="font-normal">Recurring Job</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="errand" />
                          </FormControl>
                          <FormLabel className="font-normal">Local Errand / Item Request</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Post Job
                </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}

    