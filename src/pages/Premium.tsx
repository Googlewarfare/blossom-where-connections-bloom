import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, PREMIUM_PRICE_ID } from "@/lib/auth";
import { usePremium } from "@/hooks/use-premium";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  useEffect(() => {
    if (searchParams.get("subscription_success") === "true") {
      toast.success("Welcome to Blossom Premium! Your subscription is now active.");
      checkSubscription();
      // Clean up URL
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
      const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { priceId: PREMIUM_PRICE_ID },
      });

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

  const handleManageSubscription = async () => {
    if (!session) return;

    setIsManaging(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

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

  return (
    <div className="min-h-screen bg-background">
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
            <p className="text-muted-foreground">Unlock the full dating experience</p>
          </div>
        </div>

        {/* Current Status */}
        {hasPremium && (
          <Card className="mb-8 border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-full">
                    <Crown className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">You're a Premium Member!</p>
                    <p className="text-sm text-muted-foreground">
                      Renews on {new Date(premiumEndDate!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleManageSubscription} disabled={isManaging}>
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
        {!hasPremium && (
          <Card className="mb-8 border-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-bl-lg">
              Most Popular
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl">Premium</CardTitle>
              <CardDescription>Everything you need to find your match</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-5xl font-bold">$14.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Button
                size="lg"
                className="w-full max-w-xs"
                onClick={handleSubscribe}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Get Premium
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Cancel anytime. No commitments.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Features Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Premium Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PREMIUM_FEATURES_LIST.map((feature, index) => (
              <Card key={index} className={hasPremium ? "border-green-500/30" : ""}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{feature.title}</h3>
                      {hasPremium && (
                        <Badge variant="outline" className="text-green-500 border-green-500/50 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">Can I cancel anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! You can cancel your subscription at any time. You'll keep your premium benefits until the end of your billing period.
              </p>
            </div>
            <div>
              <h4 className="font-medium">How do profile boosts work?</h4>
              <p className="text-sm text-muted-foreground">
                Profile boosts put your profile at the top of potential matches in your area for 30 minutes, getting you up to 10x more views.
              </p>
            </div>
            <div>
              <h4 className="font-medium">What happens to my likes if I downgrade?</h4>
              <p className="text-sm text-muted-foreground">
                Your matches and conversations stay intact. You'll just lose access to premium features like seeing who liked you.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
