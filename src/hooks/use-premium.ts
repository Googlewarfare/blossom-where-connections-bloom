import { useAuth, PREMIUM_FEATURES } from "@/lib/auth";

export const usePremium = () => {
  const { subscriptionStatus } = useAuth();

  const hasPremium =
    subscriptionStatus?.subscriptions?.some(
      (sub) => sub.product_id === PREMIUM_FEATURES.BLOSSOM_PREMIUM,
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

  return {
    hasPremium,
    hasUnlimitedSuperLikes: hasPremium || hasUnlimitedSuperLikes,
    hasReadReceipts: hasPremium || hasReadReceipts,
    hasUnlimitedSwipes: hasPremium,
    canSeeWhoLikedYou: hasPremium,
    hasProfileBoosts: hasPremium,
    premiumEndDate: premiumSubscription?.subscription_end,
    isSubscribed: subscriptionStatus?.subscribed ?? false,
  };
};
