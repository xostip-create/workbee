"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  role: z.enum(["worker", "customer"], {
    required_error: "You need to select a role.",
  }),
});

export function RegisterForm() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const userAccountRef = doc(firestore, "userAccounts", user.uid);
      const userProfileRef = doc(firestore, "userProfiles", user.uid);

      // Create UserAccount
      setDocumentNonBlocking(userAccountRef, {
        id: user.uid,
        email: user.email,
        role: values.role,
        createdAt: new Date().toISOString(),
        userProfileId: user.uid,
      }, { merge: true });

      // Create UserProfile
      setDocumentNonBlocking(userProfileRef, {
        id: user.uid,
        fullName: values.fullName,
        userAccountId: user.uid,
      }, { merge: true });

      // Create Role-specific Profile
      if (values.role === 'worker') {
        const workerProfileRef = doc(firestore, "workerProfiles", user.uid);
        setDocumentNonBlocking(workerProfileRef, {
            id: user.uid,
            availability: "Not specified",
            status: "Pending Approval",
            skillCategoryIds: [],
            userProfileId: user.uid,
            userAccountId: user.uid,
        }, { merge: true });
      } else { // customer
        const customerProfileRef = doc(firestore, "customerProfiles", user.uid);
        setDocumentNonBlocking(customerProfileRef, {
            id: user.uid,
            isVerified: false,
            userProfileId: user.uid,
            userAccountId: user.uid,
        }, { merge: true });
      }

      toast({
        title: "Account Created",
        description: "Redirecting you to complete your profile.",
      });
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Registration Error:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.code === 'auth/email-already-in-use' 
          ? "This email is already in use."
          : error.message || "An unexpected error occurred.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>I am a...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="worker" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Worker / Job Seeker
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="customer" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Customer / Employer
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="underline text-primary">
            Login
          </Link>
        </div>
      </form>
    </Form>
  );
}
