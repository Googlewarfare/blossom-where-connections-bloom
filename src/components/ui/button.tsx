import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Premium variants
        gradient:
          "gradient-primary text-primary-foreground shadow-soft hover:shadow-glow hover:scale-[1.02]",
        glow: "bg-primary text-primary-foreground shadow-glow hover:shadow-elevated animate-pulse-soft",
        glass: "glass text-foreground hover:bg-card/90",
        premium:
          "bg-gradient-to-r from-blossom-magenta to-blossom-coral text-white shadow-soft hover:shadow-glow hover:scale-[1.02] border-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// Haptic feedback helper
const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Haptics.impact({ style });
  } catch {
    // Silently fail if haptics unavailable
  }
};

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  haptic?: boolean | "light" | "medium" | "heavy";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, haptic = true, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        // Trigger haptic feedback
        if (haptic && !props.disabled) {
          const style = haptic === "heavy" 
            ? ImpactStyle.Heavy 
            : haptic === "medium" 
              ? ImpactStyle.Medium 
              : ImpactStyle.Light;
          triggerHaptic(style);
        }
        
        // Call original onClick handler
        onClick?.(e);
      },
      [haptic, onClick, props.disabled]
    );
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
