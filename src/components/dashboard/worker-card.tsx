import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Verified, MapPin } from "lucide-react";
import type { DisplayWorker } from "@/types";

type WorkerCardProps = {
  worker: DisplayWorker;
};

export function WorkerCard({ worker }: WorkerCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center text-center pb-2">
        <Avatar className="h-20 w-20 mb-2">
          <AvatarImage src={worker.avatar} alt={worker.name} data-ai-hint="person smiling" />
          <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="flex items-center gap-2 text-lg">
            {worker.name}
            {worker.verified && <Verified className="h-5 w-5 text-primary" />}
        </CardTitle>
        <CardDescription className="flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{worker.location}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center flex-grow">
        <div className="flex flex-wrap justify-center gap-1 mb-4">
          {worker.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">{skill || 'skill'}</Badge>
          ))}
          {worker.skills.length > 3 && <Badge variant="outline">+{worker.skills.length - 3}</Badge>}
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{(worker.rating || 0).toFixed(1)}</span>
            </div>
            {worker.distance !== null && (
                <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{worker.distance.toFixed(1)} km away</span>
                </div>
            )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-2">
        <Button asChild className="flex-1" size="sm">
            <Link href={`/profile/${worker.id}`}>View Profile</Link>
        </Button>
        <Button variant="outline" className="flex-1" size="sm">Contact</Button>
      </CardFooter>
    </Card>
  );
}
