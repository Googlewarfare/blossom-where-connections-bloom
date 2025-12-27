import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface ConversationStatus {
  activeCount: number;
  canStartNew: boolean;
  isAtLimit: boolean;
  remainingSlots: number;
}

const MAX_ACTIVE_CONVERSATIONS = 3;

export function useConversationStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<ConversationStatus>({
    activeCount: 0,
    canStartNew: true,
    isAtLimit: false,
    remainingSlots: MAX_ACTIVE_CONVERSATIONS,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase.rpc("get_active_conversation_count", {
        p_user_id: user.id,
      });

      const count = data ?? 0;
      setStatus({
        activeCount: count,
        canStartNew: count < MAX_ACTIVE_CONVERSATIONS,
        isAtLimit: count >= MAX_ACTIVE_CONVERSATIONS,
        remainingSlots: Math.max(0, MAX_ACTIVE_CONVERSATIONS - count),
      });
    } catch (error) {
      console.error("Error fetching conversation status:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...status, loading, refresh };
}
