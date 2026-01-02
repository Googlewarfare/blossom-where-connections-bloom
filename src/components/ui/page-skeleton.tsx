import { Skeleton } from "@/components/ui/skeleton";

/**
 * Lightweight skeleton loader for route transitions.
 * Faster to render than the full AppLoader, reducing perceived load time.
 */
export const PageSkeleton = () => {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Simple header skeleton */}
      <div className="h-16 border-b border-border/50 px-4 flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      
      {/* Content area skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
