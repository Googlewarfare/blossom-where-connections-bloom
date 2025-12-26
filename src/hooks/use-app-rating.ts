import { useCallback, useEffect } from "react";
import { Capacitor } from "@capacitor/core";

const RATING_PROMPTED_KEY = "blossom_rating_prompted";
const POSITIVE_INTERACTIONS_KEY = "blossom_positive_interactions";
const INTERACTIONS_THRESHOLD = 3;

/**
 * Hook to manage App Store / Play Store rating prompts.
 * Triggers after positive interactions (matches, successful conversations, etc.)
 */
export const useAppRating = () => {
  const isNative = Capacitor.isNativePlatform();

  const getInteractionCount = useCallback((): number => {
    const stored = localStorage.getItem(POSITIVE_INTERACTIONS_KEY);
    return stored ? parseInt(stored, 10) : 0;
  }, []);

  const hasBeenPrompted = useCallback((): boolean => {
    return localStorage.getItem(RATING_PROMPTED_KEY) === "true";
  }, []);

  const recordPositiveInteraction = useCallback(() => {
    if (!isNative) return;

    const current = getInteractionCount();
    localStorage.setItem(POSITIVE_INTERACTIONS_KEY, String(current + 1));
  }, [isNative, getInteractionCount]);

  const shouldPromptRating = useCallback((): boolean => {
    if (!isNative) return false;
    if (hasBeenPrompted()) return false;

    return getInteractionCount() >= INTERACTIONS_THRESHOLD;
  }, [isNative, hasBeenPrompted, getInteractionCount]);

  const requestRating = useCallback(async () => {
    if (!isNative) return;

    try {
      // Mark as prompted so we don't ask again
      localStorage.setItem(RATING_PROMPTED_KEY, "true");

      // Use the native rating dialog
      const platform = Capacitor.getPlatform();

      if (platform === "ios") {
        // iOS uses SKStoreReviewController via a custom implementation
        // or falls back to opening App Store
        const appStoreUrl =
          "https://apps.apple.com/app/idYOUR_APP_ID?action=write-review";
        window.open(appStoreUrl, "_blank");
      } else if (platform === "android") {
        // Android opens Play Store
        const playStoreUrl =
          "https://play.google.com/store/apps/details?id=app.lovable.83c9e8a99a414ffaabb041590982157d";
        window.open(playStoreUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to request app rating:", error);
    }
  }, [isNative]);

  const resetRatingPrompt = useCallback(() => {
    localStorage.removeItem(RATING_PROMPTED_KEY);
    localStorage.removeItem(POSITIVE_INTERACTIONS_KEY);
  }, []);

  return {
    isNative,
    recordPositiveInteraction,
    shouldPromptRating,
    requestRating,
    resetRatingPrompt,
    interactionCount: getInteractionCount(),
    hasBeenPrompted: hasBeenPrompted(),
  };
};
