import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Heart, Clock, Moon } from "lucide-react";
import { ConversationClosureDialog } from "./ConversationClosureDialog";
import { useToast } from "@/hooks/use-toast";

interface NudgeConversation {
  conversation_id: string;
  other_user_id: string;
  other_user_name: string;
  days_inactive: number;
  last_message_at: string;
  user_to_nudge: string;
  photo_url?: string | null;
  snoozed_until?: string | null;
}

export function GhostingNudgeDialog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [nudgeConversations, setNudgeConversations] = useState<NudgeConversation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showClosureDialog, setShowClosureDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snoozing, setSnoozing] = useState(false);

  const fetchNudgeConversations = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get conversations between 48-72 hours inactive
      const { data, error } = await supabase.rpc("get_conversations_needing_nudge");

      if (error) {
        console.error("Error fetching nudge conversations:", error);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // Filter for current user's conversations
      const userConversations = data.filter(
        (conv: NudgeConversation) => conv.user_to_nudge === user.id
      );

      // Fetch photos
      const conversationsWithPhotos = await Promise.all(
        userConversations.map(async (conv: NudgeConversation) => {
          const { data: photo } = await supabase
            .from("profile_photos")
            .select("photo_url")
            .eq("user_id", conv.other_user_id)
            .eq("is_primary", true)
            .maybeSingle();

          let signedPhotoUrl = null;
          if (photo?.photo_url) {
            const { data: signedData } = await supabase.storage
              .from("profile-photos")
              .createSignedUrl(photo.photo_url, 3600);
            signedPhotoUrl = signedData?.signedUrl || null;
          }

          return { ...conv, photo_url: signedPhotoUrl };
        })
      );

      // Filter out snoozed conversations
      const now = new Date();
      const activenudges = conversationsWithPhotos.filter((conv: NudgeConversation) => {
        if (!conv.snoozed_until) return true;
        return new Date(conv.snoozed_until) <= now;
      });

      setNudgeConversations(activenudges);
    } catch (error) {
      console.error("Error in fetchNudgeConversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNudgeConversations();
  }, [fetchNudgeConversations]);

  const currentConversation = nudgeConversations[currentIndex];

  const handleReply = () => {
    if (!currentConversation) return;
    navigate(`/chat?id=${currentConversation.conversation_id}`);
    // Remove from list
    setNudgeConversations((prev) => prev.filter((_, i) => i !== currentIndex));
  };

  const handleSnooze = async () => {
    if (!currentConversation) return;

    setSnoozing(true);
    try {
      // Set snooze for 24 hours
      const snoozeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await supabase
        .from("conversations")
        .update({ reminder_sent_at: snoozeUntil.toISOString() })
        .eq("id", currentConversation.conversation_id);

      toast({
        title: "Snoozed for 24 hours",
        description: "We'll remind you again tomorrow. Remember, they're waiting.",
      });

      // Remove from list
      const newList = nudgeConversations.filter((_, i) => i !== currentIndex);
      setNudgeConversations(newList);

      if (currentIndex >= newList.length && newList.length > 0) {
        setCurrentIndex(newList.length - 1);
      }
    } catch (error) {
      console.error("Error snoozing:", error);
    } finally {
      setSnoozing(false);
    }
  };

  const handleClosureDone = () => {
    setShowClosureDialog(false);
    const newList = nudgeConversations.filter((_, i) => i !== currentIndex);
    setNudgeConversations(newList);

    if (currentIndex >= newList.length && newList.length > 0) {
      setCurrentIndex(newList.length - 1);
    }
  };

  // Don't show if loading or no nudges
  if (loading || nudgeConversations.length === 0 || !currentConversation) {
    return null;
  }

  return (
    <>
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              A gentle reminder
            </DialogTitle>
            <DialogDescription className="text-base">
              {currentConversation.other_user_name} reached out {currentConversation.days_inactive} days ago.
              At Blossom, everyone deserves a response.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
              <Avatar className="w-14 h-14 ring-2 ring-amber-500/20">
                <AvatarImage src={currentConversation.photo_url || undefined} />
                <AvatarFallback className="bg-amber-500/10">
                  {currentConversation.other_user_name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{currentConversation.other_user_name}</p>
                <p className="text-sm text-muted-foreground">
                  Waiting for your response
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleReply}
              className="w-full justify-start h-auto py-3"
              variant="default"
            >
              <MessageCircle className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Reply now</p>
              </div>
            </Button>

            <Button
              onClick={() => setShowClosureDialog(true)}
              className="w-full justify-start h-auto py-3"
              variant="outline"
            >
              <Heart className="w-5 h-5 mr-3 text-primary" />
              <div className="text-left">
                <p className="font-medium">End conversation respectfully</p>
              </div>
            </Button>

            <Button
              onClick={handleSnooze}
              className="w-full justify-start h-auto py-3"
              variant="ghost"
              disabled={snoozing}
            >
              <Moon className="w-5 h-5 mr-3 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium text-muted-foreground">Snooze for 24 hours</p>
                <p className="text-xs text-muted-foreground">One time only</p>
              </div>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-2">
            After 72 hours, you'll need to respond or close to continue using Blossom.
          </p>
        </DialogContent>
      </Dialog>

      <ConversationClosureDialog
        open={showClosureDialog}
        onOpenChange={setShowClosureDialog}
        conversationId={currentConversation.conversation_id}
        otherUserName={currentConversation.other_user_name || "Someone"}
        onClosed={handleClosureDone}
      />
    </>
  );
}
