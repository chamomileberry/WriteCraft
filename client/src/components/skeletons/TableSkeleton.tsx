import { Skeleton } from "@/components/ui/skeleton";

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/5" />
      <Skeleton className="h-4 w-1/6" />
      <Skeleton className="h-4 w-1/6" />
      <div className="ml-auto flex gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Table header */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-muted/50">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/5" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/6" />
        <div className="ml-auto">
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  );
}
