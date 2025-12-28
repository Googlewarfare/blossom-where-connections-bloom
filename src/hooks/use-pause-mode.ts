import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function usePauseMode() {
  const { user } = useAuth();
  const [isPaused, setIsPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState<string | null>(null);
  const [pausedAt, setPausedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkPauseStatus = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_paused, pause_reason, paused_at")
        .eq("id", user.id)
        .single();

      setIsPaused(profile?.is_paused || false);
      setPauseReason(profile?.pause_reason || null);
      setPausedAt(profile?.paused_at || null);
    } catch (error) {
      console.error("Error checking pause status:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkPauseStatus();
  }, [checkPauseStatus]);

  return {
    isPaused,
    pauseReason,
    pausedAt,
    loading,
    refresh: checkPauseStatus,
  };
}
