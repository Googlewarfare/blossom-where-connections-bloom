import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Heart, Clock } from "lucide-react";
import { ConversationClosureDialog } from "./ConversationClosureDialog";

interface GhostedConversation {
  conversation_id: string;
  other_user_id: string;
  other_user_name: string;
  hours_since_last_message: number;
  photo_url?: string | null;
}

interface GhostingBlockerProps {
  children: React.ReactNode;
}

export function GhostingBlocker({ children }: GhostingBlockerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ghostedConversations, setGhostedConversations] = useState<GhostedConversation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showClosureDialog, setShowClosureDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchGhostedConversations = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Call the database function to get conversations with 72h+ no response
      const { data, error } = await supabase.rpc("get_ghosted_conversations", {
        p_user_id: user.id,
      });

      if (error) {
        console.error("Error fetching ghosted conversations:", error);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch photos for each user
      const conversationsWithPhotos = await Promise.all(
        data.map(async (conv: GhostedConversation) => {
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

          return {
            ...conv,
            photo_url: signedPhotoUrl,
          };
        })
      );

      setGhostedConversations(conversationsWithPhotos);
    } catch (error) {
      console.error("Error in fetchGhostedConversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGhostedConversations();
  }, [fetchGhostedConversations]);

  const currentConversation = ghostedConversations[currentIndex];

  const handleContinue = () => {
    if (!currentConversation) return;
    navigate(`/chat?id=${currentConversation.conversation_id}`);
  };

  const handleCloseWithKindness = () => {
    setShowClosureDialog(true);
  };

  const handleClosureDone = () => {
    setShowClosureDialog(false);
    
    // Remove current conversation from list
    const newList = ghostedConversations.filter((_, i) => i !== currentIndex);
    setGhostedConversations(newList);
    
    // Adjust index if needed
    if (currentIndex >= newList.length && newList.length > 0) {
      setCurrentIndex(newList.length - 1);
    }
  };

  const getDaysFromHours = (hours: number) => Math.floor(hours / 24);

  // If loading or no ghosted conversations, render children normally
  if (loading) {
    return <>{children}</>;
  }

  // If there are ghosted conversations, block access
  if (ghostedConversations.length > 0 && currentConversation) {
    const days = getDaysFromHours(currentConversation.hours_since_last_message);
    
    return (
      <>
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent 
            className="sm:max-w-md" 
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader className="text-center pb-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <DialogTitle className="text-xl">
                Someone is waiting for you
              </DialogTitle>
              <DialogDescription className="text-base pt-2 leading-relaxed">
                We believe everyone deserves clarity. {currentConversation.other_user_name} reached out {days} day{days !== 1 ? "s" : ""} ago and hasn't heard back. Taking a moment to respond — or to close this chapter thoughtfully — is an act of care.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                  <AvatarImage src={currentConversation.photo_url || undefined} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {currentConversation.other_user_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">
                    {currentConversation.other_user_name || "Someone"}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Waiting for a reply</span>
                  </div>
                </div>
              </div>
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
                  <p className="text-xs opacity-80">Go to the chat and respond</p>
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
            </div>

            <p className="text-xs text-center text-muted-foreground pt-3 leading-relaxed">
              This isn't a punishment — it's how we build a culture where everyone feels valued. Closure is an act of kindness.
            </p>

            {ghostedConversations.length > 1 && (
              <p className="text-xs text-center text-muted-foreground">
                {currentIndex + 1} of {ghostedConversations.length} conversations need attention
              </p>
            )}
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

  // No ghosted conversations, render children normally
  return <>{children}</>;
}
