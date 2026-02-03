import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Verified } from "lucide-react";
import type { Worker } from "@/lib/placeholder-data";

type WorkerCardProps = {
  worker: Worker;
};

export function WorkerCard({ worker }: WorkerCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center text-center">
        <Avatar className="h-20 w-20 mb-2">
          <AvatarImage src={worker.avatar} alt={worker.name} data-ai-hint="person smiling" />
          <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="flex items-center gap-2">
            {worker.name}
            {worker.verified && <Verified className="h-5 w-5 text-primary" />}
        </CardTitle>
        <CardDescription>{worker.location}</CardDescription>
      </CardHeader>
      <CardContent className="text-center flex-grow">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {worker.skills.slice(0, 2).map((skill) => (
            <Badge key={skill} variant="secondary">{skill}</Badge>
          ))}
        </div>
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{worker.rating.toFixed(1)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-2">
        <Button className="flex-1">View Profile</Button>
        <Button variant="outline" className="flex-1">Contact</Button>
      </CardFooter>
    </Card>
  );
}
