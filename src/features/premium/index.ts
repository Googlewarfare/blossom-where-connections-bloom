/**
 * Premium Feature Module
 * 
 * Handles premium subscriptions, purchases, and feature gating.
 */

// Premium page
export { default as PremiumPage } from "@/pages/Premium";

// Premium hooks
export { usePremium } from "@/hooks/use-premium";
export { useNativePurchases } from "@/hooks/use-native-purchases";

// Premium constants (re-exported from auth for convenience)
export { PREMIUM_FEATURES, PREMIUM_PRICE_ID } from "@/lib/auth";
