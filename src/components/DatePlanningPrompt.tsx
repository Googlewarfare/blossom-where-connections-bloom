import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, Shield, UserPlus, X } from "lucide-react";

interface DatePlanningPromptProps {
  onEnableCheckin: () => void;
  onAddContact: () => void;
  onSkip: () => void;
  isVisible: boolean;
}

// Keywords and phrases that suggest date planning
const DATE_PLANNING_PATTERNS = [
  // Meeting up phrases
  /\b(meet(ing)?\s*(up)?|get\s*together|hang(ing)?\s*out)\b/i,
  // Date-specific words
  /\b(date|coffee|dinner|lunch|drinks?|movie)\b/i,
  // Time/place coordination
  /\b(what\s*time|where\s*(should|do)|pick\s*(you)?\s*up)\b/i,
  // Specific venues
  /\b(restaurant|bar|cafe|park|my\s*place|your\s*place)\b/i,
  // Planning language
  /\b(this\s*(weekend|friday|saturday|sunday)|tomorrow|tonight)\b/i,
  // Confirmation language
  /\b(see\s*you\s*(at|on|there)|can't\s*wait\s*to\s*see)\b/i,
  // Address sharing
  /\b(\d+\s+\w+\s+(st|street|ave|avenue|rd|road|blvd|drive|dr))\b/i,
];

export const detectDatePlanning = (message: string): boolean => {
  // Check if message matches any date planning pattern
  return DATE_PLANNING_PATTERNS.some((pattern) => pattern.test(message));
};

export const DatePlanningPrompt = ({
  onEnableCheckin,
  onAddContact,
  onSkip,
  isVisible,
}: DatePlanningPromptProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mx-4 mb-4"
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Planning a date?</CardTitle>
                    <CardDescription className="text-sm">
                      We care about your safety and want to help you feel secure
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mt-1 -mr-2"
                  onClick={onSkip}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="default"
                  className="flex-1 gap-2"
                  onClick={onEnableCheckin}
                >
                  <Shield className="h-4 w-4" />
                  Enable Check-in
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={onAddContact}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Trusted Contact
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground text-sm"
                onClick={onSkip}
              >
                Skip for now
              </Button>
              <p className="text-xs text-muted-foreground text-center pt-1">
                Your safety is a shared responsibility. We're here to support you.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook to manage date planning detection state
export const useDatePlanningDetection = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [skippedThisSession, setSkippedThisSession] = useState(false);
  const [lastPromptTime, setLastPromptTime] = useState<number>(0);

  const checkMessage = (message: string) => {
    // Don't show if already skipped this session
    if (skippedThisSession) return;

    // Don't show more than once per 5 minutes
    const now = Date.now();
    if (now - lastPromptTime < 5 * 60 * 1000) return;

    // Check if message contains date planning language
    if (detectDatePlanning(message)) {
      setShowPrompt(true);
      setLastPromptTime(now);
    }
  };

  const skipOnce = () => {
    setShowPrompt(false);
    setSkippedThisSession(true);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
  };

  return {
    showPrompt,
    checkMessage,
    skipOnce,
    dismissPrompt,
  };
};

export default DatePlanningPrompt;
