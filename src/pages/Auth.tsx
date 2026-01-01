import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  MapPin,
  AlertTriangle,
  Fingerprint,
  ScanFace,
  Shield,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { z } from "zod";
import { getCurrentLocation } from "@/lib/location-utils";
import { checkAccountLockout, recordLoginAttempt } from "@/hooks/use-security";
import { checkPasswordBreach } from "@/hooks/use-password-check";
import { TwoFactorVerify } from "@/components/TwoFactorVerify";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { PasswordStrengthMeter, isPasswordStrong } from "@/components/PasswordStrengthMeter";
import logo from "@/assets/blossom-logo.jpg";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100)
    .refine(
      (val) => /[A-Z]/.test(val),
      { message: "Password must contain an uppercase letter" }
    )
    .refine(
      (val) => /[a-z]/.test(val),
      { message: "Password must contain a lowercase letter" }
    )
    .refine(
      (val) => /[0-9]/.test(val),
      { message: "Password must contain a number" }
    ),
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
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [showMfaVerify, setShowMfaVerify] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const {
    isAvailable: biometricAvailable,
    hasStoredCredentials,
    biometryType,
    authenticate: biometricAuthenticate,
    saveCredentials,
    getBiometryLabel,
    isNative,
    loading: biometricStateLoading,
  } = useBiometricAuth();

  // Redirect authenticated users to discover or their intended destination
  useEffect(() => {
    if (!authLoading && user) {
      const from = (routeLocation.state as { from?: { pathname: string } })?.from?.pathname || "/discover";
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, routeLocation.state]);

  // Check password against breach database on blur (signup only)
  const handlePasswordBlur = async () => {
    if (isLogin || password.length < 6) return;

    setCheckingPassword(true);
    setPasswordWarning(null);

    const { breached, count } = await checkPasswordBreach(password);

    if (breached) {
      setPasswordWarning(
        `This password has appeared in ${count.toLocaleString()} data breaches. Please choose a different password for your security.`,
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
          await supabase.functions.invoke("send-password-reset", {
            body: { email, resetLink },
          });
        } catch (emailError) {
          console.error("Failed to send password reset email:", emailError);
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
            description:
              "Too many failed login attempts. Please try again in 15 minutes.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
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
          // Check if MFA is required
          const { data: factorsData } = await supabase.auth.mfa.listFactors();
          const verifiedFactor = factorsData?.totp.find(
            (f) => f.status === "verified",
          );

          if (verifiedFactor) {
            // MFA is required - show verification screen
            setMfaFactorId(verifiedFactor.id);
            setShowMfaVerify(true);
            setLoading(false);
            return;
          }

          // Record successful login
          await recordLoginAttempt(validation.data.email, true);

          // Offer to save credentials for biometric login (on native platforms)
          if (biometricAvailable && !hasStoredCredentials) {
            await saveCredentials(
              validation.data.email,
              validation.data.password,
            );
            toast({
              title: "Welcome back!",
              description: `${getBiometryLabel()} enabled for faster login next time.`,
            });
          } else {
            toast({
              title: "Welcome back!",
              description: "You've successfully logged in.",
            });
          }
          navigate("/discover");
        }
      } else {
        // Check password against breach database before signup
        const { breached, count } = await checkPasswordBreach(
          validation.data.password,
        );
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
              description:
                "This email is already registered. Please login instead.",
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
        const {
          data: { user },
        } = await supabase.auth.getUser();
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
            await supabase.functions.invoke("send-welcome-email", {
              body: { userId: user.id },
            });
          } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
            // Don't block signup if email fails
          }
        }

        toast({
          title: "Account Created!",
          description:
            "Welcome to Blossom! Check your email for a welcome message.",
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

  const handleMfaSuccess = async () => {
    await recordLoginAttempt(email, true);
    toast({
      title: "Welcome back!",
      description: "You've successfully logged in.",
    });
    navigate("/discover");
  };

  const handleMfaCancel = async () => {
    await supabase.auth.signOut();
    setShowMfaVerify(false);
    setMfaFactorId(null);
  };

  const handleBiometricLogin = async () => {
    if (!biometricAvailable || !hasStoredCredentials) return;

    setBiometricLoading(true);
    try {
      const credentials = await biometricAuthenticate();

      if (!credentials) {
        setBiometricLoading(false);
        return;
      }

      // Check account lockout
      const isLocked = await checkAccountLockout(credentials.email);
      if (isLocked) {
        toast({
          title: "Account Temporarily Locked",
          description:
            "Too many failed login attempts. Please try again in 15 minutes.",
          variant: "destructive",
        });
        setBiometricLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        await recordLoginAttempt(credentials.email, false);
        toast({
          title: "Login Failed",
          description:
            "Biometric login failed. Please sign in with your password.",
          variant: "destructive",
        });
      } else {
        // Check if MFA is required
        const { data: factorsData } = await supabase.auth.mfa.listFactors();
        const verifiedFactor = factorsData?.totp.find(
          (f) => f.status === "verified",
        );

        if (verifiedFactor) {
          setMfaFactorId(verifiedFactor.id);
          setShowMfaVerify(true);
          setEmail(credentials.email);
          setBiometricLoading(false);
          return;
        }

        await recordLoginAttempt(credentials.email, true);
        toast({
          title: "Welcome back!",
          description: `Signed in with ${getBiometryLabel()}.`,
        });
        navigate("/discover");
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Biometric authentication was cancelled or failed.",
        variant: "destructive",
      });
    } finally {
      setBiometricLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset gradient-hero flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-3">
            <div className="p-3 rounded-2xl gradient-primary shadow-glow animate-pulse">
              <Heart className="w-8 h-8 text-primary-foreground fill-current" />
            </div>
          </div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show MFA verification screen if needed
  if (showMfaVerify && mfaFactorId) {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset gradient-hero flex items-center justify-center px-4 py-12">
        <TwoFactorVerify
          factorId={mfaFactorId}
          onSuccess={handleMfaSuccess}
          onCancel={handleMfaCancel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset gradient-hero flex items-center justify-center px-4 py-12 relative">
      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 z-20 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background transition-colors"
        aria-label="Go back to home"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full gradient-glow opacity-50" />
      </div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo & Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl gradient-primary shadow-glow">
              <Heart className="w-8 h-8 text-primary-foreground fill-current" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            {isResetPassword
              ? "Reset Password"
              : isLogin
                ? "Welcome Back"
                : "Join Blossom"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isResetPassword
              ? "Enter your email to receive reset instructions"
              : isLogin
                ? "Sign in to continue your journey"
                : "Start your journey to finding love"}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="p-8 shadow-elevated border-2 backdrop-blur-sm bg-card/95">
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
                  {/* Age Verification & Terms */}
                  <div className="p-4 bg-muted/50 rounded-xl border border-border space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="ageConfirmation"
                        required
                        className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <label htmlFor="ageConfirmation" className="text-sm">
                        <span className="font-medium">
                          I confirm that I am 18 years of age or older
                        </span>
                        <p className="text-muted-foreground mt-1">
                          By checking this box, you confirm you meet the minimum
                          age requirement to use Blossom.
                        </p>
                      </label>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="termsAcceptance"
                          required
                          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor="termsAcceptance" className="text-sm">
                          <span className="font-medium">
                            I agree to the Terms of Service and Privacy Policy
                          </span>
                          <p className="text-muted-foreground mt-1">
                            By checking this box, you agree to our{" "}
                            <a
                              href="/terms"
                              target="_blank"
                              className="text-primary hover:underline"
                            >
                              Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                              href="/privacy"
                              target="_blank"
                              className="text-primary hover:underline"
                            >
                              Privacy Policy
                            </a>
                            .
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>

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
                        {loadingLocation
                          ? "Getting location..."
                          : "Use My Location"}
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
                  minLength={8}
                  maxLength={100}
                />
                {checkingPassword && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="animate-pulse">●</span> Checking password
                    security...
                  </p>
                )}
                {passwordWarning && (
                  <div className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive">
                      {passwordWarning}
                    </p>
                  </div>
                )}
                {!isLogin && !passwordWarning && !checkingPassword && (
                  <PasswordStrengthMeter password={password} className="mt-2" />
                )}
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                size="lg"
                disabled={loading || biometricLoading || (!isLogin && !isPasswordStrong(password))}
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
              </Button>

              {/* Biometric Login Button */}
              {isLogin &&
                biometricAvailable &&
                hasStoredCredentials &&
                !biometricStateLoading && (
                  <>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          or
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-full"
                      size="lg"
                      onClick={handleBiometricLogin}
                      disabled={loading || biometricLoading}
                    >
                      {biometricLoading ? (
                        "Authenticating..."
                      ) : (
                        <>
                          {biometryType === "face" ? (
                            <ScanFace className="w-5 h-5 mr-2" />
                          ) : (
                            <Fingerprint className="w-5 h-5 mr-2" />
                          )}
                          Sign in with {getBiometryLabel()}
                        </>
                      )}
                    </Button>
                  </>
                )}

              {/* Social Sign In Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full hover:shadow-card transition-all duration-300"
                size="lg"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: {
                        redirectTo: `${window.location.origin}/discover`,
                        queryParams: {
                          access_type: "offline",
                          prompt: "consent",
                        },
                      },
                    });
                    if (error) {
                      toast({
                        title: "Sign in failed",
                        description: error.message,
                        variant: "destructive",
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to sign in with Google",
                      variant: "destructive",
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Your data is encrypted and secure</span>
              </div>
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
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
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
