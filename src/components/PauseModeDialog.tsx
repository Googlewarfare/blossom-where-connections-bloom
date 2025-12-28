import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Pause, Play, Heart, MessageCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PauseModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void;
}

const PAUSE_REASONS = [
  { id: "break", label: "I need a break from dating", icon: Pause },
  { id: "busy", label: "Life is busy right now", icon: MessageCircle },
  { id: "reflecting", label: "I'm reflecting on what I want", icon: Heart },
  { id: "other", label: "Other personal reasons", icon: Heart },
];

export function PauseModeDialog({
  open,
  onOpenChange,
  onStatusChange,
}: PauseModeDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState<string>("");
  const [canPause, setCanPause] = useState(true);
  const [activeConversations, setActiveConversations] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkPauseStatus = async () => {
      if (!user || !open) return;

      setCheckingStatus(true);
      try {
        // Check current pause status
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_paused, pause_reason")
          .eq("id", user.id)
          .single();

        setIsPaused(profile?.is_paused || false);
        setPauseReason(profile?.pause_reason || "");

        // Check if can pause (no active conversations)
        const { data: pauseCheck } = await supabase.rpc("can_pause_dating", {
          p_user_id: user.id,
        });

        if (pauseCheck && pauseCheck.length > 0) {
          setCanPause(pauseCheck[0].can_pause);
          setActiveConversations(pauseCheck[0].active_conversation_count);
        }
      } catch (error) {
        console.error("Error checking pause status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkPauseStatus();
  }, [user, open]);

  const handlePause = async () => {
    if (!user || !pauseReason) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_paused: true,
          paused_at: new Date().toISOString(),
          pause_reason: pauseReason,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Dating paused",
        description: "Take all the time you need. We'll be here when you're ready.",
      });

      setIsPaused(true);
      onOpenChange(false);
      onStatusChange?.();
    } catch (error) {
      console.error("Error pausing:", error);
      toast({
        title: "Error",
        description: "Failed to pause dating",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_paused: false,
          paused_at: null,
          pause_reason: null,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You're back in the game. Remember: quality over quantity.",
      });

      setIsPaused(false);
      onOpenChange(false);
      onStatusChange?.();
    } catch (error) {
      console.error("Error resuming:", error);
      toast({
        title: "Error",
        description: "Failed to resume dating",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToConversations = () => {
    onOpenChange(false);
    navigate("/chat");
  };

  if (checkingStatus) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPaused ? (
              <>
                <Play className="w-5 h-5 text-primary" />
                Resume Dating
              </>
            ) : (
              <>
                <Pause className="w-5 h-5 text-amber-500" />
                Pause Dating
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isPaused
              ? "Ready to get back out there? Let's confirm your intentions."
              : "Taking a break is healthy. Pause matching while you focus on yourself."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {isPaused ? (
            // Resume flow
            <div className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-xl text-center">
                <p className="text-sm text-foreground">
                  You've been paused since{" "}
                  <span className="font-medium">taking some time for yourself</span>.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  When you resume, you'll appear in discovery again.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="text-sm font-medium mb-2">Before you resume, remember:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• You can only have 3 active conversations</li>
                  <li>• Respond to messages within 72 hours</li>
                  <li>• Close conversations with kindness</li>
                </ul>
              </div>
            </div>
          ) : !canPause ? (
            // Can't pause - has active conversations
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      You have {activeConversations} active conversation{activeConversations !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      At Blossom, we don't let people disappear. Please close your 
                      conversations thoughtfully before pausing.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleGoToConversations} className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Go to Conversations
              </Button>
            </div>
          ) : (
            // Pause flow
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Why are you taking a break? (This helps us understand our community better)
              </p>

              <RadioGroup
                value={pauseReason}
                onValueChange={setPauseReason}
                className="space-y-2"
              >
                {PAUSE_REASONS.map((reason) => (
                  <div
                    key={reason.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      pauseReason === reason.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={reason.id} id={reason.id} />
                    <Label
                      htmlFor={reason.id}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  While paused, you won't appear in discovery and won't be able to match.
                  You can resume anytime.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {isPaused ? (
            <Button onClick={handleResume} disabled={loading}>
              {loading ? "Resuming..." : "Resume Dating"}
            </Button>
          ) : canPause ? (
            <Button
              onClick={handlePause}
              disabled={loading || !pauseReason}
              variant="secondary"
            >
              {loading ? "Pausing..." : "Pause Dating"}
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
