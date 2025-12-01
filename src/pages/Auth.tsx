import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, MapPin } from "lucide-react";
import { z } from "zod";
import { getCurrentLocation } from "@/lib/location-utils";
import logo from "@/assets/blossom-logo.jpg";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
  fullName: z.string().trim().max(100).optional(),
  location: z.string().trim().max(200).optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    try {
      const coords = await getCurrentLocation();
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      toast({
        title: "Location Captured",
        description: "Your location has been set successfully.",
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Unable to get your location. Please enter it manually.",
        variant: "destructive",
      });
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = authSchema.safeParse({
        email,
        password,
        fullName: isLogin ? undefined : fullName,
        location: isLogin ? undefined : location,
      });

      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: validation.data.email,
          password: validation.data.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          });
          navigate("/profile");
        }
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error: signUpError } = await supabase.auth.signUp({
          email: validation.data.email,
          password: validation.data.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: validation.data.fullName || "",
            },
          },
        });

        if (signUpError) {
          if (signUpError.message.includes("already registered")) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please login instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: signUpError.message,
              variant: "destructive",
            });
          }
          setLoading(false);
          return;
        }

        // Update profile with location data after signup
        const { data: { user } } = await supabase.auth.getUser();
        if (user && (validation.data.location || latitude !== null)) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              location: validation.data.location || null,
              latitude: latitude,
              longitude: longitude,
            })
            .eq("id", user.id);

          if (profileError) {
            console.error("Error updating profile location:", profileError);
          }
          
          // Send welcome email
          try {
            await supabase.functions.invoke('send-welcome-email', {
              body: { userId: user.id }
            });
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't block signup if email fails
          }
        }

        toast({
          title: "Account Created!",
          description: "Welcome to Blossom! Check your email for a welcome message.",
        });
        navigate("/profile");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <Heart className="w-8 h-8 text-primary fill-current" />
            <span className="text-2xl font-bold">Blossom</span>
          </div>
          <h1 className="text-3xl font-bold">
            {isLogin ? "Welcome Back" : "Join Blossom"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? "Sign in to continue your journey" : "Start your journey to finding love"}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="p-8 shadow-card border-2">
          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (City, State)</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., New York, NY"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    maxLength={200}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGetLocation}
                      disabled={loadingLocation}
                      className="w-full"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {loadingLocation ? "Getting location..." : "Use My Location"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We use your location to show distance to other users
                  </p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={100}
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-smooth"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="font-semibold">
                {isLogin ? "Sign Up" : "Sign In"}
              </span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
