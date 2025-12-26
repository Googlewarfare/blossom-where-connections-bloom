import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Heart, MessageCircle, Calendar, X } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PROMPT_DISMISSED_KEY = "blossom_push_prompt_dismissed";

const benefits = [
  {
    icon: Heart,
    title: "New Matches",
    description: "Know instantly when someone likes you back",
  },
  {
    icon: MessageCircle,
    title: "Messages",
    description: "Never miss a message from your matches",
  },
  {
    icon: Calendar,
    title: "Events & Updates",
    description: "Stay informed about events near you",
  },
];

interface PushNotificationPromptProps {
  onComplete?: () => void;
}

export const PushNotificationPrompt = ({
  onComplete,
}: PushNotificationPromptProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, isNative, isRegistered } = usePushNotifications();
  const { toast } = useToast();

  useEffect(() => {
    // Only show on native platforms
    if (!isNative) return;

    // Don't show if already registered
    if (isRegistered) return;

    // Check if user already dismissed the prompt
    const dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
    if (dismissed) return;

    // Show after a short delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isNative, isRegistered]);

  const handleEnable = async () => {
    setLoading(true);
    try {
      await register();
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive updates about matches and messages.",
      });
      setIsOpen(false);
      onComplete?.();
    } catch (error) {
      toast({
        title: "Permission Required",
        description: "Please enable notifications in your device settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, "true");
    setIsOpen(false);
    onComplete?.();
  };

  const handleMaybeLater = () => {
    setIsOpen(false);
    onComplete?.();
  };

  // Don't render anything on non-native platforms
  if (!isNative) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
            <Bell className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Stay Connected</DialogTitle>
          <DialogDescription className="text-base">
            Enable notifications to never miss important updates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className="p-2 rounded-full bg-primary/10 shrink-0">
                <benefit.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{benefit.title}</p>
                <p className="text-xs text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleEnable}
            className="w-full rounded-full"
            size="lg"
            disabled={loading}
          >
            {loading ? "Enabling..." : "Enable Notifications"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleMaybeLater}
            className="w-full"
            size="sm"
          >
            Maybe Later
          </Button>
          <button
            onClick={handleDismiss}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Don't ask again
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
