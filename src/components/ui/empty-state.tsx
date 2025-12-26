import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Bell,
  Search,
  Users,
  Calendar,
  Star,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "premium" | "outline";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "py-8 px-4",
      icon: "w-12 h-12",
      iconWrapper: "w-20 h-20",
      title: "text-lg",
      description: "text-sm",
    },
    md: {
      container: "py-12 px-6",
      icon: "w-16 h-16",
      iconWrapper: "w-28 h-28",
      title: "text-xl",
      description: "text-base",
    },
    lg: {
      container: "py-16 px-8",
      icon: "w-20 h-20",
      iconWrapper: "w-36 h-36",
      title: "text-2xl",
      description: "text-lg",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center animate-fade-in",
        sizes.container,
        className,
      )}
    >
      {/* Animated icon container */}
      <div className="relative mb-6">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse-soft" />
        {/* Icon wrapper */}
        <div
          className={cn(
            "relative rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center",
            sizes.iconWrapper,
          )}
        >
          <Icon
            className={cn("text-muted-foreground/60", sizes.icon)}
            strokeWidth={1.5}
          />
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary/40 animate-bounce-soft" />
        <div
          className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full bg-accent/40 animate-bounce-soft"
          style={{ animationDelay: "0.3s" }}
        />
      </div>

      {/* Text content */}
      <h3
        className={cn(
          "font-display font-bold text-foreground mb-2",
          sizes.title,
        )}
      >
        {title}
      </h3>
      <p
        className={cn("text-muted-foreground max-w-sm mb-6", sizes.description)}
      >
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              className="gap-2"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              className="text-muted-foreground"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-configured empty states for common scenarios
export function EmptyMatches({ onDiscover }: { onDiscover?: () => void }) {
  return (
    <EmptyState
      icon={Heart}
      title="No matches yet"
      description="Start discovering profiles to find your perfect match. Your next connection could be just a swipe away!"
      action={
        onDiscover
          ? {
              label: "Start Discovering",
              onClick: onDiscover,
              variant: "premium",
            }
          : undefined
      }
    />
  );
}

export function EmptyMessages({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyState
      icon={MessageCircle}
      title="No messages yet"
      description="When you match with someone, you can start a conversation here. Break the ice and say hello!"
      action={
        onExplore
          ? {
              label: "Find Someone to Chat",
              onClick: onExplore,
            }
          : undefined
      }
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={Bell}
      title="All caught up!"
      description="You don't have any notifications right now. We'll let you know when something exciting happens."
      size="sm"
    />
  );
}

export function EmptySearch({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        query
          ? `We couldn't find anything matching "${query}". Try adjusting your search or filters.`
          : "Try adjusting your search criteria or filters to find what you're looking for."
      }
    />
  );
}

export function EmptyEvents({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No upcoming events"
      description="Be the first to organize a meetup! Events are a great way to connect with people who share your interests."
      action={
        onCreate
          ? {
              label: "Create Event",
              onClick: onCreate,
            }
          : undefined
      }
    />
  );
}

export function EmptyLikes() {
  return (
    <EmptyState
      icon={Star}
      title="No likes yet"
      description="Keep being yourself! When someone likes your profile, you'll see them here."
    />
  );
}

export function EmptyProfiles({
  onAdjustFilters,
}: {
  onAdjustFilters?: () => void;
}) {
  return (
    <EmptyState
      icon={Users}
      title="No profiles nearby"
      description="We couldn't find profiles matching your preferences. Try expanding your search radius or adjusting filters."
      action={
        onAdjustFilters
          ? {
              label: "Adjust Filters",
              onClick: onAdjustFilters,
            }
          : undefined
      }
    />
  );
}
