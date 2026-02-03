import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { WorkerCard } from "@/components/dashboard/worker-card";
import { workers } from "@/lib/placeholder-data";

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search for Workers</h1>
        <p className="text-muted-foreground">Find the perfect professional for your job.</p>
      </div>
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by skill, name, or location..."
          className="w-full pl-8 sm:w-[300px] md:w-1/3"
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {workers.map((worker) => (
          <WorkerCard key={worker.id} worker={worker} />
        ))}
      </div>
    </div>
  );
}
