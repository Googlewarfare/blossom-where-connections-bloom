import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonProfile() {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Skeleton className="h-64 w-full rounded-none" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
          <Skeleton className="h-20 w-20 rounded-full border-4 border-card" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      <CardContent className="pt-8 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <div className="flex gap-2 pt-4">
          <Skeleton className="h-10 flex-1 rounded-full" />
          <Skeleton className="h-10 flex-1 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-card">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonMessage({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
        >
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div
            className={`space-y-1.5 max-w-[70%] ${
              i % 2 === 0 ? "" : "items-end"
            }`}
          >
            <Skeleton
              className={`h-16 rounded-2xl ${
                i % 2 === 0
                  ? "w-48 rounded-tl-sm"
                  : "w-56 rounded-tr-sm ml-auto"
              }`}
            />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6, cols = 3 }: { count?: number; cols?: number }) {
  return (
    <div
      className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}