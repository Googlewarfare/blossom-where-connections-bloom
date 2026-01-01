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
    // Legacy premium add-ons (ethical only)
    hasPremium,
    hasUnlimitedSuperLikes: hasPremium || hasUnlimitedSuperLikes,
    hasReadReceipts: hasPremium || hasReadReceipts,
    premiumEndDate: premiumSubscription?.subscription_end,

    // Intentional Membership features (ethical premium)
    hasIntentionalMembership,
    intentionalEndDate: intentionalSubscription?.subscription_end,

    // Intentional Membership benefits - depth focused, NOT volume focused
    hasPriorityTrustVisibility: hasIntentionalMembership, // Priority in trust-weighted matching
    hasDeeperCompatibilityInsights: hasIntentionalMembership, // Detailed compatibility breakdowns
    hasAdvancedVerification: hasIntentionalMembership, // Advanced verification options
    hasEnhancedSafetyTools: hasIntentionalMembership, // Enhanced safety features

    // CONSTRAINTS ENFORCED - These features are NEVER provided:
    // ❌ No unlimited swipes - everyone has the same conversation limits
    // ❌ No boosts or popularity metrics - trust score is earned, not bought
    // ❌ No bypassing closure or match limits - accountability applies to all
    // ❌ No gamifying trust or effort - no artificial visibility advantages

    isSubscribed: subscriptionStatus?.subscribed ?? false,
  };
};
