import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, INTENTIONAL_MEMBERSHIP_PRICE_ID } from "@/lib/auth";
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
  Heart,
  Shield,
  Eye,
  Sparkles,
  CheckCircle,
  Loader2,
  RotateCcw,
  Apple,
  Users,
  Lock,
  XCircle,
} from "lucide-react";

const INTENTIONAL_FEATURES = [
  {
    icon: Eye,
    title: "Priority Trust Visibility",
    description: "Your profile is prioritized to users with high trust scores — quality over quantity",
  },
  {
    icon: Sparkles,
    title: "Deeper Compatibility Insights",
    description: "See detailed breakdowns of what makes you compatible, beyond the surface level",
  },
  {
    icon: Shield,
    title: "Advanced Verification Options",
    description: "Additional verification badges and identity confirmation tools",
  },
  {
    icon: Lock,
    title: "Enhanced Safety Tools",
    description: "Advanced safety features including detailed date check-in and trusted contact alerts",
  },
];

const NOT_INCLUDED = [
  {
    icon: Users,
    title: "No Extra Match Limits",
    description: "3 conversations at a time — because depth requires focus",
  },
  {
    icon: XCircle,
    title: "No Accountability Bypass",
    description: "Ghosting rules still apply — everyone deserves respect",
  },
  {
    icon: Heart,
    title: "No Popularity Boosts",
    description: "No artificial visibility — your trust score speaks for itself",
  },
];

export default function Premium() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, checkSubscription } = useAuth();
  const { hasIntentionalMembership, intentionalEndDate } = usePremium();
  const [isLoading, setIsLoading] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const {
    isNative,
    products,
    loading: nativeLoading,
    purchaseProduct,
    restorePurchases,
    hasActivePremium: hasNativePremium,
  } = useNativePurchases();

  const isActive = hasIntentionalMembership || hasNativePremium;

  useEffect(() => {
    if (searchParams.get("subscription_success") === "true") {
      toast.success(
        "Welcome to Intentional Membership! You're now part of a community that values depth.",
      );
      checkSubscription();
      window.history.replaceState({}, "", "/premium");
    }
  }, [searchParams, checkSubscription]);

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
          body: { priceId: INTENTIONAL_MEMBERSHIP_PRICE_ID },
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

  const handleNativePurchase = async (productId: string) => {
    if (!session) {
      toast.error("Please log in to subscribe");
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      const success = await purchaseProduct(productId);
      if (success) {
        toast.success("Welcome to Intentional Membership!");
      }
    } catch (error) {
      console.error("Error with native purchase:", error);
      toast.error("Failed to complete purchase. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

    if (isNative && hasNativePremium) {
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

  const getNativePrice = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.price || "Loading...";
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-background">
      <Navbar />
      <div className="w-full max-w-4xl mx-auto py-8 px-4 box-border">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              Intentional Membership
            </h1>
            <p className="text-muted-foreground">
              Support depth over volume
            </p>
          </div>
        </div>

        {/* Philosophy Statement */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <p className="text-center text-lg leading-relaxed text-foreground/90">
              "Intentional Membership isn't about getting more matches — it's about making better connections.
              We believe depth requires limits, and everyone deserves accountability."
            </p>
          </CardContent>
        </Card>

        {/* Current Status */}
        {isActive && (
          <Card className="mb-8 border-primary/50 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      You're an Intentional Member
                    </p>
                    {intentionalEndDate && (
                      <p className="text-sm text-muted-foreground">
                        Renews on{" "}
                        {new Date(intentionalEndDate).toLocaleDateString()}
                      </p>
                    )}
                    {hasNativePremium && !intentionalEndDate && (
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

        {/* Pricing Card */}
        {!isActive && (
          <Card className="mb-8 border-primary/50 relative overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Intentional Membership</CardTitle>
              <CardDescription>Depth over volume</CardDescription>
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
                className="w-full max-w-sm"
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
                    <Heart className="h-4 w-4 mr-2" />
                    Join Intentional Membership
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Restore Purchases */}
        {isNative && !isActive && (
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

        {!isActive && (
          <p className="text-xs text-muted-foreground text-center mb-8">
            Cancel anytime. Your support helps us build a more intentional dating culture.
            {isNative && " Subscription will be charged to your Apple ID."}
          </p>
        )}

        {/* What's Included */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">What's Included</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {INTENTIONAL_FEATURES.map((feature, index) => (
              <Card
                key={index}
                className={isActive ? "border-primary/30" : ""}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{feature.title}</h3>
                      {isActive && (
                        <Badge
                          variant="outline"
                          className="text-primary border-primary/50 text-xs"
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

        {/* What's NOT Included - Accountability Preserved */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">What's NOT Included</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Paying doesn't give you shortcuts. Everyone is held to the same standards.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {NOT_INCLUDED.map((item, index) => (
              <Card key={index} className="border-muted bg-muted/20">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
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
              <h4 className="font-medium">Why can't I get more matches with membership?</h4>
              <p className="text-sm text-muted-foreground">
                We believe depth requires limits. Having 3 active conversations encourages meaningful investment in each connection, rather than treating dating like a numbers game.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Will I still have to follow ghosting rules?</h4>
              <p className="text-sm text-muted-foreground">
                Yes. Everyone deserves closure and respect, regardless of subscription status. Accountability is a core value — not a feature to be unlocked.
              </p>
            </div>
            <div>
              <h4 className="font-medium">What does "priority trust visibility" mean?</h4>
              <p className="text-sm text-muted-foreground">
                Your profile is shown more prominently to users with high trust scores — people who respond thoughtfully, close conversations respectfully, and show up consistently.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Can I cancel anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! You can cancel your subscription at any time. You'll keep your benefits until the end of your billing period.
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
