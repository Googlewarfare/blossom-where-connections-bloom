import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, PREMIUM_PRICE_ID } from "@/lib/auth";
import { usePremium } from "@/hooks/use-premium";
import { useNativePurchases, IAP_PRODUCTS } from "@/hooks/use-native-purchases";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  Crown,
  Heart,
  Eye,
  Zap,
  Infinity,
  CheckCircle,
  Loader2,
  Sparkles,
  RotateCcw,
  Apple,
} from "lucide-react";

const PREMIUM_FEATURES_LIST = [
  {
    icon: Infinity,
    title: "Unlimited Swipes",
    description: "Swipe as much as you want without daily limits",
  },
  {
    icon: Eye,
    title: "See Who Liked You",
    description: "View everyone who has liked your profile",
  },
  {
    icon: Zap,
    title: "Profile Boosts",
    description: "Get 5 free boosts per month for more visibility",
  },
  {
    icon: Heart,
    title: "Unlimited Super Likes",
    description: "Stand out with unlimited Super Likes",
  },
  {
    icon: CheckCircle,
    title: "Read Receipts",
    description: "See when your messages are read",
  },
  {
    icon: Sparkles,
    title: "Priority Matching",
    description: "Your profile gets prioritized in potential matches",
  },
];

export default function Premium() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, session, checkSubscription } = useAuth();
  const { hasPremium, premiumEndDate } = usePremium();
  const [isLoading, setIsLoading] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Native purchases hook for iOS/Android
  const {
    isNative,
    products,
    loading: nativeLoading,
    purchaseProduct,
    restorePurchases,
    hasActivePremium: hasNativePremium,
  } = useNativePurchases();

  // Combined premium status (web or native)
  const isPremiumActive = hasPremium || hasNativePremium;

  useEffect(() => {
    if (searchParams.get("subscription_success") === "true") {
      toast.success(
        "Welcome to Blossom Premium! Your subscription is now active.",
      );
      checkSubscription();
      window.history.replaceState({}, "", "/premium");
    }
  }, [searchParams, checkSubscription]);

  // Handle web subscription via Stripe
  const handleSubscribe = async () => {
    if (!session) {
      toast.error("Please log in to subscribe");
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-subscription-checkout",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: { priceId: PREMIUM_PRICE_ID },
        },
      );

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle native iOS/Android purchase
  const handleNativePurchase = async (productId: string) => {
    if (!user) {
      toast.error("Please log in to subscribe");
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      const success = await purchaseProduct(productId);
      if (success) {
        toast.success("Welcome to Blossom Premium!");
      }
    } catch (error) {
      console.error("Error with native purchase:", error);
      toast.error("Failed to complete purchase. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle restore purchases (required by Apple)
  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      await restorePurchases();
      toast.success("Purchases restored successfully!");
    } catch (error) {
      console.error("Error restoring purchases:", error);
      toast.error("Failed to restore purchases. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session) return;

    // On iOS, direct to App Store subscriptions
    if (isNative && hasNativePremium) {
      // Open iOS subscription management
      window.open("https://apps.apple.com/account/subscriptions", "_blank");
      return;
    }

    setIsManaging(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "customer-portal",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Failed to open subscription management. Please try again.");
    } finally {
      setIsManaging(false);
    }
  };

  // Get native product price
  const getNativePrice = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.price || "Loading...";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              Blossom Premium
            </h1>
            <p className="text-muted-foreground">
              Unlock the full dating experience
            </p>
          </div>
        </div>

        {/* Current Status */}
        {isPremiumActive && (
          <Card className="mb-8 border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-full">
                    <Crown className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      You're a Premium Member!
                    </p>
                    {premiumEndDate && (
                      <p className="text-sm text-muted-foreground">
                        Renews on{" "}
                        {new Date(premiumEndDate).toLocaleDateString()}
                      </p>
                    )}
                    {hasNativePremium && !premiumEndDate && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Apple className="h-3 w-3" /> Subscribed via App Store
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={isManaging}
                >
                  {isManaging ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Manage Subscription"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Cards */}
        {!isPremiumActive && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {/* Monthly Plan */}
            <Card className="border-primary/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-bl-lg">
                Monthly
              </div>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription>Flexible monthly plan</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  {isNative ? (
                    <span className="text-4xl font-bold">
                      {nativeLoading
                        ? "..."
                        : getNativePrice(IAP_PRODUCTS.PREMIUM_MONTHLY)}
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">$14.99</span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() =>
                    isNative
                      ? handleNativePurchase(IAP_PRODUCTS.PREMIUM_MONTHLY)
                      : handleSubscribe()
                  }
                  disabled={isLoading || nativeLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      {isNative && <Apple className="h-4 w-4 mr-2" />}
                      <Crown className="h-4 w-4 mr-2" />
                      Subscribe Monthly
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Yearly Plan */}
            <Card className="border-green-500/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                Best Value
              </div>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Premium Yearly</CardTitle>
                <CardDescription>Save over 40%</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  {isNative ? (
                    <span className="text-4xl font-bold">
                      {nativeLoading
                        ? "..."
                        : getNativePrice(IAP_PRODUCTS.PREMIUM_YEARLY)}
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">$99.99</span>
                      <span className="text-muted-foreground">/year</span>
                    </>
                  )}
                </div>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={() =>
                    isNative
                      ? handleNativePurchase(IAP_PRODUCTS.PREMIUM_YEARLY)
                      : handleSubscribe()
                  }
                  disabled={isLoading || nativeLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      {isNative && <Apple className="h-4 w-4 mr-2" />}
                      <Crown className="h-4 w-4 mr-2" />
                      Subscribe Yearly
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Restore Purchases - Required by Apple */}
        {isNative && !isPremiumActive && (
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={handleRestorePurchases}
              disabled={isRestoring}
              className="text-muted-foreground"
            >
              {isRestoring ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Restore Purchases
            </Button>
          </div>
        )}

        {!isPremiumActive && (
          <p className="text-xs text-muted-foreground text-center mb-8">
            Cancel anytime. No commitments.
            {isNative && " Subscription will be charged to your Apple ID."}
          </p>
        )}

        {/* Features Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Premium Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PREMIUM_FEATURES_LIST.map((feature, index) => (
              <Card
                key={index}
                className={isPremiumActive ? "border-green-500/30" : ""}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{feature.title}</h3>
                      {isPremiumActive && (
                        <Badge
                          variant="outline"
                          className="text-green-500 border-green-500/50 text-xs"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">Can I cancel anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! You can cancel your subscription at any time. You'll keep
                your premium benefits until the end of your billing period.
              </p>
            </div>
            <div>
              <h4 className="font-medium">How do profile boosts work?</h4>
              <p className="text-sm text-muted-foreground">
                Profile boosts put your profile at the top of potential matches
                in your area for 30 minutes, getting you up to 10x more views.
              </p>
            </div>
            <div>
              <h4 className="font-medium">
                What happens to my likes if I downgrade?
              </h4>
              <p className="text-sm text-muted-foreground">
                Your matches and conversations stay intact. You'll just lose
                access to premium features like seeing who liked you.
              </p>
            </div>
            {isNative && (
              <div>
                <h4 className="font-medium">
                  How do I manage my subscription?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Go to Settings → Apple ID → Subscriptions on your device to
                  manage or cancel your subscription.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
