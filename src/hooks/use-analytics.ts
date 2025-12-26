import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

// Generate a session ID for anonymous tracking
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
};

export function usePageTracking() {
  const location = useLocation();
  const { user } = useAuth();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid duplicate tracking for the same path
    if (lastTrackedPath.current === location.pathname) {
      return;
    }

    lastTrackedPath.current = location.pathname;

    const trackPageView = async () => {
      try {
        const sessionId = getSessionId();

        await supabase.from("page_views").insert({
          path: location.pathname,
          user_id: user?.id || null,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          session_id: sessionId,
        });
      } catch (error) {
        // Silently fail - analytics should not break the app
        console.debug("Analytics tracking error:", error);
      }
    };

    trackPageView();
  }, [location.pathname, user?.id]);
}

// Hook for tracking custom events
export function useEventTracking() {
  const { user } = useAuth();

  const trackEvent = async (
    eventName: string,
    properties?: Record<string, unknown>,
  ) => {
    try {
      const sessionId = getSessionId();

      await supabase.from("page_views").insert({
        path: `event:${eventName}`,
        user_id: user?.id || null,
        referrer: JSON.stringify(properties) || null,
        user_agent: navigator.userAgent,
        session_id: sessionId,
      });
    } catch (error) {
      console.debug("Event tracking error:", error);
    }
  };

  return { trackEvent };
}
