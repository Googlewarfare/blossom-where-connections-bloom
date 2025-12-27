import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const MAX_ACTIVE_CONVERSATIONS = 3;

export function useSwipeLimits() {
  const { user } = useAuth();
  const [canSwipe, setCanSwipe] = useState(true);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const checkLimits = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Check if user can start new conversations
      const { data: canStart, error: canStartError } = await supabase.rpc(
        "can_start_new_conversation",
        { p_user_id: user.id }
      );

      if (canStartError) {
        console.error("Error checking conversation limit:", canStartError);
        setCanSwipe(true); // Fail open
        setLoading(false);
        return;
      }

      // Get active conversation count
      const { data: count, error: countError } = await supabase.rpc(
        "get_active_conversation_count",
        { p_user_id: user.id }
      );

      if (countError) {
        console.error("Error getting conversation count:", countError);
      }

      setCanSwipe(canStart ?? true);
      setActiveCount(count ?? 0);
    } catch (error) {
      console.error("Error in useSwipeLimits:", error);
      setCanSwipe(true); // Fail open
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkLimits();
  }, [checkLimits]);

  const remainingSlots = Math.max(0, MAX_ACTIVE_CONVERSATIONS - activeCount);

  return {
    canSwipe,
    activeCount,
    remainingSlots,
    maxConversations: MAX_ACTIVE_CONVERSATIONS,
    loading,
    refresh: checkLimits,
  };
}
