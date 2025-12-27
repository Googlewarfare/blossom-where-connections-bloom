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
import { AlertTriangle, MessageCircle, Heart, Clock } from "lucide-react";
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
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Someone is waiting for you
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                At Blossom, we don't let connections fade into silence. 
                {currentConversation.other_user_name} has been waiting for {days} days.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                  <AvatarImage src={currentConversation.photo_url || undefined} />
                  <AvatarFallback className="text-lg bg-primary/10">
                    {currentConversation.other_user_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">
                    {currentConversation.other_user_name || "Someone"}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Waiting {days} days for your response</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive font-medium">
                  Your access to Blossom is paused until you respond or close this conversation.
                </p>
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

            {ghostedConversations.length > 1 && (
              <p className="text-xs text-center text-muted-foreground pt-2">
                {currentIndex + 1} of {ghostedConversations.length} conversations requiring your attention
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
