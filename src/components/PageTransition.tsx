import { motion, type Transition, type Variants } from "framer-motion";
import { ReactNode, createContext, useContext, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
  variant?: "fade" | "slide" | "scale" | "slideUp";
}

// Context to track navigation direction
interface TransitionContextType {
  direction: "forward" | "back";
  setDirection: (dir: "forward" | "back") => void;
}

const TransitionContext = createContext<TransitionContextType>({
  direction: "forward",
  setDirection: () => {},
});

export const useTransitionDirection = () => useContext(TransitionContext);

export const TransitionProvider = ({ children }: { children: ReactNode }) => {
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  
  const handleSetDirection = useCallback((dir: "forward" | "back") => {
    setDirection(dir);
  }, []);
  
  return (
    <TransitionContext.Provider value={{ direction, setDirection: handleSetDirection }}>
      {children}
    </TransitionContext.Provider>
  );
};

// Smooth spring-based transition
const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

// Elegant tween for fades
const fadeTransition: Transition = {
  type: "tween",
  ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
  duration: 0.35,
};

// Variants for different transition styles
const fadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

const slideVariants: Variants = {
  initial: {
    opacity: 0,
    x: 60,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    x: -40,
    scale: 0.98,
  },
};

const slideUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.99,
  },
};

const scaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 1.02,
  },
};

const getVariants = (variant: PageTransitionProps["variant"]): Variants => {
  switch (variant) {
    case "slide":
      return slideVariants;
    case "scale":
      return scaleVariants;
    case "slideUp":
      return slideUpVariants;
    case "fade":
    default:
      return fadeVariants;
  }
};

const getTransition = (variant: PageTransitionProps["variant"]): Transition => {
  switch (variant) {
    case "slide":
    case "slideUp":
    case "scale":
      return springTransition;
    case "fade":
    default:
      return fadeTransition;
  }
};

export const PageTransition = ({ children, variant = "slideUp" }: PageTransitionProps) => {
  const location = useLocation();
  const variants = getVariants(variant);
  const transition = getTransition(variant);
  
  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={transition}
      className="will-change-transform"
      style={{ 
        minHeight: "inherit",
        // Prevent horizontal scroll during slide animations
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Simplified page wrapper for content that needs delayed reveal
export const PageContent = ({ children, delay = 0.15 }: { children: ReactNode; delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "tween",
        ease: "easeOut",
        duration: 0.3,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};

// Staggered children animation for lists
export const StaggerContainer = ({ 
  children, 
  staggerDelay = 0.05,
  className = "" 
}: { 
  children: ReactNode; 
  staggerDelay?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 15, scale: 0.98 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};
