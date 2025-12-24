import * as React from "react";
import { cn } from "@/lib/utils";
import { Heart, Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "heart" | "dots" | "pulse";
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  variant = "default",
  className,
  label,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const labelSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  if (variant === "heart") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <Heart
          className={cn(
            sizeClasses[size],
            "text-primary fill-primary animate-heartbeat"
          )}
        />
        {label && (
          <span
            className={cn(
              "text-muted-foreground animate-pulse-soft",
              labelSizes[size]
            )}
          >
            {label}
          </span>
        )}
      </div>
    );
  }

  if (variant === "dots") {
    const dotSize = {
      sm: "w-1.5 h-1.5",
      md: "w-2 h-2",
      lg: "w-3 h-3",
      xl: "w-4 h-4",
    };

    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "rounded-full bg-primary animate-bounce-soft",
                dotSize[size]
              )}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        {label && (
          <span className={cn("text-muted-foreground", labelSizes[size])}>
            {label}
          </span>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className="relative">
          <div
            className={cn(
              "rounded-full bg-primary/20 animate-ping absolute inset-0",
              sizeClasses[size]
            )}
          />
          <div
            className={cn(
              "rounded-full bg-primary relative",
              sizeClasses[size]
            )}
          />
        </div>
        {label && (
          <span className={cn("text-muted-foreground", labelSizes[size])}>
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <Loader2 className={cn(sizeClasses[size], "text-primary animate-spin")} />
      {label && (
        <span className={cn("text-muted-foreground", labelSizes[size])}>
          {label}
        </span>
      )}
    </div>
  );
}

// Full page loading overlay
export function LoadingOverlay({
  label = "Loading...",
  variant = "heart",
}: {
  label?: string;
  variant?: "default" | "heart" | "dots" | "pulse";
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <LoadingSpinner size="xl" variant={variant} label={label} />
    </div>
  );
}

// Inline loading state for buttons
export function ButtonLoading({ className }: { className?: string }) {
  return <Loader2 className={cn("w-4 h-4 animate-spin", className)} />;
}