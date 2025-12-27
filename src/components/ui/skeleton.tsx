import { cn } from "@/lib/utils";

function Skeleton({
  className,
  shimmer = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { shimmer?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted relative overflow-hidden",
        shimmer && "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

// Profile Card Skeleton - matches the discover/profile card layout
function ProfileCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl overflow-hidden bg-card border shadow-sm", className)}>
      {/* Image placeholder */}
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name and age */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-8" />
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* Bio */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        
        {/* Tags/Interests */}
        <div className="flex gap-2 flex-wrap pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Compact profile card for matches list
function ProfileCardCompactSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-xl bg-card border", className)}>
      <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
}

// Chat message skeleton
function ChatMessageSkeleton({ 
  isOwn = false,
  className 
}: { 
  isOwn?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex gap-2 mb-3",
      isOwn ? "flex-row-reverse" : "flex-row",
      className
    )}>
      {!isOwn && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
      <div className={cn(
        "space-y-1.5 max-w-[70%]",
        isOwn ? "items-end" : "items-start"
      )}>
        <Skeleton 
          className={cn(
            "h-10 rounded-2xl",
            isOwn 
              ? "w-32 rounded-br-sm bg-primary/20" 
              : "w-40 rounded-bl-sm"
          )} 
        />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

// Chat list with multiple message skeletons
function ChatListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-1 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <ChatMessageSkeleton key={i} isOwn={i % 3 === 0} />
      ))}
    </div>
  );
}

// Conversation list item skeleton
function ConversationSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 p-4 border-b", className)}>
      <div className="relative">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}

// Full conversation list skeleton
function ConversationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <ConversationSkeleton key={i} />
      ))}
    </div>
  );
}

// Discovery grid skeleton
function DiscoveryGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProfileCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Event card skeleton
function EventCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl overflow-hidden bg-card border", className)}>
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Stats card skeleton
function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 rounded-xl bg-card border space-y-2", className)}>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export { 
  Skeleton,
  ProfileCardSkeleton,
  ProfileCardCompactSkeleton,
  ChatMessageSkeleton,
  ChatListSkeleton,
  ConversationSkeleton,
  ConversationListSkeleton,
  DiscoveryGridSkeleton,
  EventCardSkeleton,
  StatsCardSkeleton,
};
