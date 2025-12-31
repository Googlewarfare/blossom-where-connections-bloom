import { useAuth, PREMIUM_FEATURES } from "@/lib/auth";

export const usePremium = () => {
  const { subscriptionStatus } = useAuth();

  const hasPremium =
    subscriptionStatus?.subscriptions?.some(
      (sub) => sub.product_id === PREMIUM_FEATURES.BLOSSOM_PREMIUM,
    ) ?? false;

  const hasIntentionalMembership =
    subscriptionStatus?.subscriptions?.some(
      (sub) => sub.product_id === PREMIUM_FEATURES.INTENTIONAL_MEMBERSHIP,
    ) ?? false;

  const hasUnlimitedSuperLikes =
    subscriptionStatus?.subscriptions?.some(
      (sub) => sub.product_id === PREMIUM_FEATURES.UNLIMITED_SUPER_LIKES,
    ) ?? false;

  const hasReadReceipts =
    subscriptionStatus?.subscriptions?.some(
      (sub) => sub.product_id === PREMIUM_FEATURES.READ_RECEIPTS,
    ) ?? false;

  const premiumSubscription = subscriptionStatus?.subscriptions?.find(
    (sub) => sub.product_id === PREMIUM_FEATURES.BLOSSOM_PREMIUM,
  );

  const intentionalSubscription = subscriptionStatus?.subscriptions?.find(
    (sub) => sub.product_id === PREMIUM_FEATURES.INTENTIONAL_MEMBERSHIP,
  );

  return {
    // Legacy premium features
    hasPremium,
    hasUnlimitedSuperLikes: hasPremium || hasUnlimitedSuperLikes,
    hasReadReceipts: hasPremium || hasReadReceipts,
    hasUnlimitedSwipes: hasPremium,
    canSeeWhoLikedYou: hasPremium,
    hasProfileBoosts: hasPremium,
    premiumEndDate: premiumSubscription?.subscription_end,

    // Intentional Membership features (ethical premium)
    hasIntentionalMembership,
    intentionalEndDate: intentionalSubscription?.subscription_end,

    // Intentional Membership benefits - depth focused, NOT volume focused
    hasPriorityTrustVisibility: hasIntentionalMembership, // Priority in trust-weighted matching
    hasDeeperCompatibilityInsights: hasIntentionalMembership, // Detailed compatibility breakdowns
    hasAdvancedVerification: hasIntentionalMembership, // Advanced verification options
    hasEnhancedSafetyTools: hasIntentionalMembership, // Enhanced safety features

    // What Intentional Membership does NOT provide (accountability preserved)
    // - No increased match limits (still 3 max)
    // - No bypassing ghosting accountability
    // - No popularity boosts or artificial visibility

    isSubscribed: subscriptionStatus?.subscribed ?? false,
  };
};
