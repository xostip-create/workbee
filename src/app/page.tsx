import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Check, Star, Search, DollarSign, ShieldCheck } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { WorkBeeLogo } from '@/components/icons';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-landing');
  const howItWorksCustomerImage = PlaceHolderImages.find(img => img.id === 'how-it-works-customer');
  const howItWorksWorkerImage = PlaceHolderImages.find(img => img.id === 'how-it-works-worker');
  const testimonialAvatars = {
    avatar1: PlaceHolderImages.find(img => img.id === 'avatar1'),
    avatar2: PlaceHolderImages.find(img => img.id === 'avatar2'),
    avatar3: PlaceHolderImages.find(img => img.id === 'avatar3'),
  };

  const whyChooseUsFeatures = [
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: "Vetted & Verified Workers",
      description: "Every worker on our platform is reviewed and approved by our admin team, ensuring you hire with confidence.",
    },
    {
      icon: <DollarSign className="h-10 w-10 text-primary" />,
      title: "Secure Payments",
      description: "Our integrated payment system holds your money securely until you confirm the job is completed to your satisfaction.",
    },
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: "Find The Right Skill",
      description: "From plumbers to painters, our location-based search helps you find the perfect local professional for any task.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah L.",
      role: "Homeowner",
      avatar: testimonialAvatars.avatar2,
      quote: "Finding a reliable plumber used to be a nightmare. With E&F WorkBee, I found a vetted professional in my area within an hour. The whole process was seamless!",
    },
    {
      name: "Tunde O.",
      role: "Electrician",
      avatar: testimonialAvatars.avatar1,
      quote: "As a freelancer, E&F WorkBee has been a game-changer. It connects me directly with clients in my locality, and the secure payment system means I never have to chase an invoice.",
    },
    {
      name: "David C.",
      role: "Small Business Owner",
      avatar: testimonialAvatars.avatar3,
      quote: "I needed to get my new office painted on a tight deadline. I posted the job and got three competitive quotes the same day. The quality of work was exceptional. Highly recommended!",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] w-full bg-primary/10">
          <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Your Local Help, On-Demand
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
              Connect with trusted local workers for any job, big or small. From quick errands to skilled trades, find the right help right here.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/dashboard/jobs/new">Post a Job</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/dashboard/search">Find a Worker</Link>
              </Button>
            </div>
          </div>
          {heroImage && (
             <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                priority
                className="object-cover object-center opacity-10"
                data-ai-hint={heroImage.imageHint}
             />
          )}
        </section>

        {/* Why Choose Us Section */}
        <section id="why-choose-us" className="py-16 sm:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                A Platform Built on Trust and Quality
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We provide the tools you need to hire with confidence and work with security.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {whyChooseUsFeatures.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-card py-16 sm:py-24">
            <div className="container space-y-16">
                {/* For Customers */}
                <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-16">
                    {howItWorksCustomerImage && (
                        <div className="relative h-80 w-full overflow-hidden rounded-lg">
                            <Image
                                src={howItWorksCustomerImage.imageUrl}
                                alt={howItWorksCustomerImage.description}
                                fill
                                className="object-cover"
                                data-ai-hint={howItWorksCustomerImage.imageHint}
                            />
                        </div>
                    )}
                    <div>
                        <Badge variant="outline" className="mb-4">For Customers</Badge>
                        <h2 className="text-3xl font-bold tracking-tight">Get Your Job Done in 4 Easy Steps</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Hiring a local professional has never been easier.</p>
                        <ul className="mt-8 space-y-6">
                            <li className="flex gap-4">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
                                <div>
                                    <h4 className="text-lg font-semibold">Post Your Job</h4>
                                    <p className="text-muted-foreground">Describe what you need done. It's free and takes just a few minutes.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
                                <div>
                                    <h4 className="text-lg font-semibold">Get Quotes</h4>
                                    <p className="text-muted-foreground">Receive proposals from skilled and available workers near you.</p>
                                </div>
                            </li>
                             <li className="flex gap-4">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
                                <div>
                                    <h4 className="text-lg font-semibold">Hire & Pay Securely</h4>
                                    <p className="text-muted-foreground">Choose the best worker and secure the payment. We hold it until the job is done.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">4</div>
                                <div>
                                    <h4 className="text-lg font-semibold">Approve & Rate</h4>
                                    <p className="text-muted-foreground">Once satisfied, approve the payment release and leave a review.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                 {/* For Workers */}
                <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-16">
                     <div className="md:order-2">
                        <Badge variant="outline" className="mb-4">For Workers</Badge>
                        <h2 className="text-3xl font-bold tracking-tight">Find Work That Fits You</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Turn your skills into earnings with a flexible schedule.</p>
                        <ul className="mt-8 space-y-6">
                            <li className="flex gap-4">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
                                <div>
                                    <h4 className="text-lg font-semibold">Create Your Profile</h4>
                                    <p className="text-muted-foreground">Sign up, build your profile, and showcase your skills to get approved.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
                                <div>
                                    <h4 className="text-lg font-semibold">Browse Local Jobs</h4>
                                    <p className="text-muted-foreground">Find job postings in your area that match your expertise.</p>
                                </div>
                            </li>
                             <li className="flex gap-4">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
                                <div>
                                    <h4 className="text-lg font-semibold">Send Proposals</h4>
                                    <p className="text-muted-foreground">Send competitive quotes directly to customers through our secure chat.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">4</div>
                                <div>
                                    <h4 className="text-lg font-semibold">Get Paid</h4>
                                    <p className="text-muted-foreground">Complete the work and get paid securely and reliably upon job completion.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    {howItWorksWorkerImage && (
                        <div className="relative h-80 w-full overflow-hidden rounded-lg md:order-1">
                            <Image
                                src={howItWorksWorkerImage.imageUrl}
                                alt={howItWorksWorkerImage.description}
                                fill
                                className="object-cover"
                                data-ai-hint={howItWorksWorkerImage.imageHint}
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 sm:py-24">
            <div className="container">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Trusted by Your Neighbors
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        See what people are saying about their experience with E&F WorkBee.
                    </p>
                </div>
                <div className="mt-16 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                    {testimonials.map((testimonial) => (
                        <Card key={testimonial.name} className="flex flex-col">
                            <CardContent className="pt-6 flex-grow">
                                <div className="flex items-center mb-4">
                                    <Avatar className="h-12 w-12 border-2 border-primary">
                                        {testimonial.avatar && <AvatarImage src={testimonial.avatar.imageUrl} alt={testimonial.name} />}
                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4">
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-muted-foreground">"{testimonial.quote}"</p>
                            </CardContent>
                            <CardHeader>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="bg-primary/5 py-16 sm:py-24">
            <div className="container text-center">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                    Ready to Get Started?
                </h2>
                <p className="mt-4 mx-auto max-w-2xl text-lg text-muted-foreground">
                    Join our community today. Whether you're looking to hire or looking for work, E&F WorkBee is the place to connect.
                </p>
                 <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg">
                        <Link href="/auth/register">Sign Up Now</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-card">
            <div className="container py-8">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                     <div className="flex items-center space-x-2">
                        <WorkBeeLogo className="h-6 w-6 text-primary" />
                        <span className="font-bold">E&F WorkBee</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} E&F WorkBee. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
      </main>
    </div>
  );
}
