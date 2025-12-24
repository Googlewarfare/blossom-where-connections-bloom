import * as React from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]",
        "bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "transition-all duration-200",
        className
      )}
    >
      {children}
    </a>
  );
}

// Visually hidden but accessible to screen readers
export function VisuallyHidden({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const Comp = asChild ? React.Fragment : "span";
  return <Comp className="sr-only">{children}</Comp>;
}

// Announce dynamic content to screen readers
export function LiveRegion({
  children,
  "aria-live": ariaLive = "polite",
  "aria-atomic": ariaAtomic = true,
  className,
}: {
  children: React.ReactNode;
  "aria-live"?: "polite" | "assertive" | "off";
  "aria-atomic"?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  );
}