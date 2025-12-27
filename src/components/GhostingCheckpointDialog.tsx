import { useEffect, useState, useCallback } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Pause, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConversationClosureDialog } from "./ConversationClosureDialog";

interface InactiveConversation {
  id: string;
  other_user: {
    id: string;
    full_name: string;
    photo_url: string | null;
  };
  last_message_at: string;
  days_inactive: number;
}

interface GhostingCheckpointDialogProps {
  onComplete?: () => void;
}

export function GhostingCheckpointDialog({ onComplete }: GhostingCheckpointDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inactiveConversations, setInactiveConversations] = useState<InactiveConversation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [showClosureDialog, setShowClosureDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchInactiveConversations = useCallback(async () => {
    if (!user) return;

    try {
      // Get conversations where user was last to receive a message (not sender)
      // and it's been 3+ days without response
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(`
          id,
          updated_at,
          match_id,
          status,
          matches (
            user1_id,
            user2_id
          )
        `)
        .eq("status", "active")
        .lt("updated_at", new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      if (!conversations || conversations.length === 0) {
        setLoading(false);
        return;
      }

      // Filter to conversations where user needs to respond
      const userConversations = await Promise.all(
        conversations.map(async (conv) => {
          const match = conv.matches;
          if (!match) return null;

          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;

          // Check if the last message was from the other person
          const { data: lastMessage } = await supabase
            .from("messages")
            .select("sender_id, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          // If no messages or user sent last message, skip
          if (!lastMessage || lastMessage.sender_id === user.id) return null;

          // Get other user's profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", otherUserId)
            .single();

          // Get photo
          const { data: photo } = await supabase
            .from("profile_photos")
            .select("photo_url")
            .eq("user_id", otherUserId)
            .eq("is_primary", true)
            .maybeSingle();

          let signedPhotoUrl = null;
          if (photo?.photo_url) {
            const { data: signedData } = await supabase.storage
              .from("profile-photos")
              .createSignedUrl(photo.photo_url, 3600);
            signedPhotoUrl = signedData?.signedUrl || null;
          }

          const daysInactive = Math.floor(
            (Date.now() - new Date(lastMessage.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            id: conv.id,
            other_user: {
              id: otherUserId,
              full_name: profile?.full_name || "Someone",
              photo_url: signedPhotoUrl,
            },
            last_message_at: lastMessage.created_at,
            days_inactive: daysInactive,
          };
        })
      );

      const filtered = userConversations.filter((c): c is InactiveConversation => c !== null);
      
      if (filtered.length > 0) {
        setInactiveConversations(filtered);
        setOpen(true);
      }
    } catch (error) {
      console.error("Error fetching inactive conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInactiveConversations();
  }, [fetchInactiveConversations]);

  const currentConversation = inactiveConversations[currentIndex];

  const handleContinue = () => {
    if (!currentConversation) return;
    setOpen(false);
    navigate(`/chat?id=${currentConversation.id}`);
    onComplete?.();
  };

  const handleCloseWithKindness = () => {
    setShowClosureDialog(true);
  };

  const handlePause = async () => {
    if (!currentConversation || !user) return;

    // Mark as paused (we'll keep it active but acknowledge the pause)
    // Move to next conversation or close
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < inactiveConversations.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setOpen(false);
      onComplete?.();
    }
  };

  const handleClosureDone = () => {
    setShowClosureDialog(false);
    moveToNext();
  };

  if (loading || inactiveConversations.length === 0) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent 
          className="sm:max-w-md" 
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Clock className="w-5 h-5 text-amber-500" />
              A moment of presence
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {currentConversation.other_user.full_name} reached out{" "}
              {currentConversation.days_inactive} days ago. At Blossom, we believe 
              everyone deserves acknowledgment.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
              <Avatar className="w-14 h-14">
                <AvatarImage src={currentConversation.other_user.photo_url || undefined} />
                <AvatarFallback className="text-lg">
                  {currentConversation.other_user.full_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">
                  {currentConversation.other_user.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Waiting for your response
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-4">
              Choose how you'd like to proceed:
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleContinue}
              className="w-full justify-start h-auto py-4"
              variant="default"
            >
              <MessageCircle className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Continue the conversation</p>
                <p className="text-xs opacity-80">Reply with intention</p>
              </div>
            </Button>

            <Button
              onClick={handleCloseWithKindness}
              className="w-full justify-start h-auto py-4"
              variant="outline"
            >
              <Heart className="w-5 h-5 mr-3 text-primary" />
              <div className="text-left">
                <p className="font-medium">Close with kindness</p>
                <p className="text-xs text-muted-foreground">Send a thoughtful goodbye</p>
              </div>
            </Button>

            <Button
              onClick={handlePause}
              className="w-full justify-start h-auto py-4"
              variant="ghost"
            >
              <Pause className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Pause intentionally</p>
                <p className="text-xs text-muted-foreground">I'll respond when I'm ready</p>
              </div>
            </Button>
          </div>

          {inactiveConversations.length > 1 && (
            <p className="text-xs text-center text-muted-foreground pt-2">
              {currentIndex + 1} of {inactiveConversations.length} conversations
            </p>
          )}
        </DialogContent>
      </Dialog>

      {currentConversation && (
        <ConversationClosureDialog
          open={showClosureDialog}
          onOpenChange={setShowClosureDialog}
          conversationId={currentConversation.id}
          otherUserName={currentConversation.other_user.full_name}
          onClosed={handleClosureDone}
        />
      )}
    </>
  );
}
