import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Header } from '@/components/layout/header';
import { CheckCircle, MapPin, Briefcase, MessageSquare } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');
  const featureImages = {
    search: PlaceHolderImages.find(img => img.id === 'feature-search'),
    jobs: PlaceHolderImages.find(img => img.id === 'feature-jobs'),
    secure: PlaceHolderImages.find(img => img.id === 'feature-secure'),
  };

  const features = [
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: 'Location-Based Search',
      description: 'Find approved and verified workers in your specific area with ease.',
      image: featureImages.search,
    },
    {
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      title: 'Seamless Job Posting',
      description: 'Employers can post jobs and get matched with skilled workers quickly.',
      image: featureImages.jobs,
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: 'Secure Communication',
      description: 'Communicate and handle payments securely within the app for peace of mind.',
      image: featureImages.secure,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative h-[60vh] min-h-[500px] w-full">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white p-4">
            <h1 className="text-4xl font-bold md:text-6xl font-headline">Find the Right Help, Right Here.</h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl">
              E&F WorkBee connects you with trusted local workers for any job, big or small.
              Safe, secure, and simple.
            </p>
            <div className="mt-8 flex gap-4">
              <Button asChild size="lg">
                <Link href="/auth/register">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/dashboard/search">Find a Worker</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="container py-12 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl font-headline">A Platform Built on Trust</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We provide the tools you need to hire with confidence and work with security.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader className="items-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow text-center">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-card py-12 md:py-24">
          <div className="container grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl font-headline">Why Choose E&F WorkBee?</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our commitment to safety and quality sets us apart.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                  <div>
                    <h3 className="font-semibold">Admin-Approved Members</h3>
                    <p className="text-muted-foreground">Every worker and employer is verified to ensure a safe and trustworthy community.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                  <div>
                    <h3 className="font-semibold">Integrated Payments</h3>
                    <p className="text-muted-foreground">Handle all transactions securely through our in-app payment system.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                  <div>
                    <h3 className="font-semibold">Dedicated Support</h3>
                    <p className="text-muted-foreground">Our team is here to help you every step of the way.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative h-80 w-full overflow-hidden rounded-lg">
                {featureImages.secure && (
                    <Image
                        src={featureImages.secure.imageUrl}
                        alt={featureImages.secure.description}
                        fill
                        className="object-cover"
                        data-ai-hint={featureImages.secure.imageHint}
                    />
                )}
            </div>
          </div>
        </section>
        
        <footer className="border-t">
            <div className="container py-6 text-center text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} E&F WorkBee. All rights reserved.</p>
            </div>
        </footer>
      </main>
    </div>
  );
}
