import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, MapPin, ShieldAlert, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { getCurrentLocation } from "@/lib/location-utils";
import { checkAccountLockout, recordLoginAttempt } from "@/hooks/use-security";
import { checkPasswordBreach } from "@/hooks/use-password-check";
import logo from "@/assets/blossom-logo.jpg";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
  fullName: z.string().trim().max(100).optional(),
  location: z.string().trim().max(200).optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [passwordWarning, setPasswordWarning] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check password against breach database on blur (signup only)
  const handlePasswordBlur = async () => {
    if (isLogin || password.length < 6) return;
    
    setCheckingPassword(true);
    setPasswordWarning(null);
    
    const { breached, count } = await checkPasswordBreach(password);
    
    if (breached) {
      setPasswordWarning(
        `This password has appeared in ${count.toLocaleString()} data breaches. Please choose a different password for your security.`
      );
    }
    
    setCheckingPassword(false);
  };

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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = z.string().email().safeParse(email);
      if (!validation.success) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Send branded password reset email
        try {
          const resetLink = `${window.location.origin}/reset-password`;
          await supabase.functions.invoke('send-password-reset', {
            body: { email, resetLink }
          });
        } catch (emailError) {
          console.error('Failed to send password reset email:', emailError);
        }

        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions.",
        });
        setIsResetPassword(false);
        setEmail("");
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
        // Check if account is locked due to failed attempts
        const isLocked = await checkAccountLockout(validation.data.email);
        if (isLocked) {
          toast({
            title: "Account Temporarily Locked",
            description: "Too many failed login attempts. Please try again in 15 minutes.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: validation.data.email,
          password: validation.data.password,
        });

        if (error) {
          // Record failed login attempt
          await recordLoginAttempt(validation.data.email, false);
          
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
          // Record successful login
          await recordLoginAttempt(validation.data.email, true);
          
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in.",
          });
          navigate("/discover");
        }
      } else {
        // Check password against breach database before signup
        const { breached, count } = await checkPasswordBreach(validation.data.password);
        if (breached) {
          toast({
            title: "Compromised Password Detected",
            description: `This password has appeared in ${count.toLocaleString()} data breaches. Please choose a different password.`,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

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
        if (user) {
          // Update location if provided
          if (validation.data.location || latitude !== null) {
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
          }
          
          // Send welcome email (always try for new signups)
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
        navigate("/onboarding");
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
            {isResetPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Join Blossom"}
          </h1>
          <p className="text-muted-foreground">
            {isResetPassword 
              ? "Enter your email to receive reset instructions" 
              : isLogin 
                ? "Sign in to continue your journey" 
                : "Start your journey to finding love"}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="p-8 shadow-card border-2">
          {isResetPassword ? (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetPassword(false);
                    setEmail("");
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordWarning(null);
                }}
                onBlur={handlePasswordBlur}
                required
                minLength={6}
                maxLength={100}
              />
              {checkingPassword && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="animate-pulse">●</span> Checking password security...
                </p>
              )}
              {passwordWarning && (
                <div className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{passwordWarning}</p>
                </div>
              )}
              {!isLogin && !passwordWarning && !checkingPassword && (
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
          )}

          {!isResetPassword && (
            <div className="mt-6 space-y-4 text-center">
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setIsResetPassword(true)}
                  className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                >
                  Forgot password?
                </button>
              )}
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
          )}
        </Card>
      </div>
    </div>
  );
};

export default Auth;
