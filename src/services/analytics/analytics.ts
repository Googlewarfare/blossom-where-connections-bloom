/**
 * Analytics Service
 * 
 * Centralized analytics tracking for page views and custom events.
 * This service abstracts the analytics implementation for easy swapping
 * if we need to migrate to a different provider.
 */

import { supabase } from "@/services/supabase";

// Session ID for anonymous tracking
let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;
  
  sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

export interface TrackPageViewParams {
  path: string;
  userId?: string | null;
  referrer?: string;
}

export interface TrackEventParams {
  eventName: string;
  userId?: string | null;
  properties?: Record<string, unknown>;
}

/**
 * Track a page view
 */
export async function trackPageView({ path, userId, referrer }: TrackPageViewParams): Promise<void> {
  try {
    await supabase.from("page_views").insert({
      path,
      user_id: userId || null,
      referrer: referrer || document.referrer || null,
      user_agent: navigator.userAgent,
      session_id: getSessionId(),
    });
  } catch (error) {
    // Analytics should never break the app
    console.debug("Analytics page view error:", error);
  }
}

/**
 * Track a custom event
 */
export async function trackEvent({ eventName, userId, properties }: TrackEventParams): Promise<void> {
  try {
    await supabase.from("page_views").insert({
      path: `event:${eventName}`,
      user_id: userId || null,
      referrer: properties ? JSON.stringify(properties) : null,
      user_agent: navigator.userAgent,
      session_id: getSessionId(),
    });
  } catch (error) {
    console.debug("Analytics event tracking error:", error);
  }
}

/**
 * Analytics service singleton
 */
export const analytics = {
  trackPageView,
  trackEvent,
  getSessionId,
};
