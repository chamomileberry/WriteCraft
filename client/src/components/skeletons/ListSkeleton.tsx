import { Skeleton } from "@/components/ui/skeleton";

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border">
      <Skeleton className="h-12 w-12 rounded-md flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export function ListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {Array.from({ length: count }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}
