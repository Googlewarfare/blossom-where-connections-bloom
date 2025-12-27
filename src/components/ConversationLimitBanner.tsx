import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MAX_ACTIVE_CONVERSATIONS = 3;

interface ConversationLimitBannerProps {
  onLimitReached?: () => void;
}

export function ConversationLimitBanner({ onLimitReached }: ConversationLimitBannerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveCount = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase.rpc("get_active_conversation_count", {
          p_user_id: user.id,
        });

        if (!error && data !== null) {
          setActiveCount(data);
          if (data >= MAX_ACTIVE_CONVERSATIONS && onLimitReached) {
            onLimitReached();
          }
        }
      } catch (error) {
        console.error("Error fetching conversation count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCount();
  }, [user, onLimitReached]);

  if (loading) return null;

  const isAtLimit = activeCount >= MAX_ACTIVE_CONVERSATIONS;
  const remaining = MAX_ACTIVE_CONVERSATIONS - activeCount;

  if (activeCount === 0) return null;

  return (
    <Alert
      className={`mb-4 ${
        isAtLimit
          ? "border-amber-500/30 bg-amber-50 dark:bg-amber-950/20"
          : "border-primary/20 bg-primary/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isAtLimit ? "bg-amber-500/10" : "bg-primary/10"
          }`}
        >
          {isAtLimit ? (
            <Heart className="w-5 h-5 text-amber-600" />
          ) : (
            <MessageCircle className="w-5 h-5 text-primary" />
          )}
        </div>
        <AlertDescription className="flex-1">
          {isAtLimit ? (
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">
                You have {activeCount} active conversations
              </p>
              <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                To start new connections, close or archive an existing conversation first. 
                This helps you focus on meaningful connections.
              </p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-foreground">
                {remaining} conversation slot{remaining !== 1 ? "s" : ""} available
              </p>
              <p className="text-sm text-muted-foreground">
                Blossom limits active conversations to help you build deeper connections.
              </p>
            </div>
          )}
        </AlertDescription>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/chat")}
          className="shrink-0"
        >
          View Chats
        </Button>
      </div>
    </Alert>
  );
}

export function useConversationLimit() {
  const { user } = useAuth();
  const [canStartNew, setCanStartNew] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLimit = async () => {
      if (!user) return;

      try {
        const { data } = await supabase.rpc("can_start_new_conversation", {
          p_user_id: user.id,
        });

        setCanStartNew(data ?? true);
      } catch (error) {
        console.error("Error checking conversation limit:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLimit();
  }, [user]);

  return { canStartNew, loading };
}
