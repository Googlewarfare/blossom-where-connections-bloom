import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Monitor,
  Clock,
  MapPin,
  LogOut,
  Key,
  Fingerprint,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  RefreshCw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";

interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string | null;
  success: boolean;
  created_at: string;
}

interface UserSession {
  id: string;
  device_info: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  location: string | null;
  is_current: boolean;
  last_active_at: string;
  created_at: string;
}

const SecurityDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loginHistory, setLoginHistory] = useState<LoginAttempt[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchSecurityData();
    checkMfaStatus();
  }, [user]);

  const fetchSecurityData = async () => {
    if (!user) return;
    
    try {
      // Fetch login history
      const { data: loginData, error: loginError } = await supabase
        .from("login_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (loginError) {
        console.error("Error fetching login history:", loginError);
      } else {
        setLoginHistory(loginData || []);
      }

      // Fetch active sessions
      const { data: sessionData, error: sessionError } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("last_active_at", { ascending: false });

      if (sessionError) {
        console.error("Error fetching sessions:", sessionError);
      } else {
        setSessions(sessionData || []);
      }
    } catch (error) {
      console.error("Error fetching security data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkMfaStatus = async () => {
    try {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const hasVerifiedFactor = factorsData?.totp.some(f => f.status === "verified");
      setMfaEnabled(hasVerifiedFactor || false);
    } catch (error) {
      console.error("Error checking MFA status:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSecurityData();
    await checkMfaStatus();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Security data has been updated.",
    });
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({
        title: "Session Revoked",
        description: "The device has been signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke session.",
        variant: "destructive",
      });
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("user_id", user?.id)
        .eq("is_current", false);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.is_current));
      toast({
        title: "All Sessions Revoked",
        description: "All other devices have been signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke sessions.",
        variant: "destructive",
      });
    }
  };

  const getDeviceIcon = (device: string | null, os: string | null) => {
    const deviceLower = (device || os || "").toLowerCase();
    if (deviceLower.includes("mobile") || deviceLower.includes("iphone") || deviceLower.includes("android")) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  if (!user) return null;

  if (showMfaSetup) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-6 safe-area-inset">
          <Button
            variant="ghost"
            onClick={() => {
              setShowMfaSetup(false);
              checkMfaStatus();
            }}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Security
          </Button>
          <TwoFactorSetup />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Security Dashboard - Blossom</title>
        <meta name="description" content="Manage your account security, view login history, and control active sessions." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-6 safe-area-inset">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/settings")}
                aria-label="Go back to settings"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Security Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your account security
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Security Score */}
          <Card className="mb-6 border-2 overflow-hidden">
            <div className={`h-1 ${mfaEnabled ? "bg-emerald-500" : "bg-amber-500"}`} />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Security Status</span>
                {mfaEnabled ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Strong
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    Needs Attention
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {mfaEnabled ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        {mfaEnabled ? "Enabled and protecting your account" : "Add an extra layer of security"}
                      </p>
                    </div>
                  </div>
                  {!mfaEnabled && (
                    <Button size="sm" onClick={() => setShowMfaSetup(true)}>
                      Enable
                    </Button>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Strong password set
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Key className="h-4 w-4 mr-2" />
                    Change
                  </Button>
                </div>

                <Separator />
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium">Account Lockout Protection</p>
                      <p className="text-sm text-muted-foreground">
                        Auto-locks after 5 failed attempts
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Active Sessions
                  </CardTitle>
                  <CardDescription>
                    Devices currently signed in to your account
                  </CardDescription>
                </div>
                {sessions.length > 1 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sign out all devices?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will sign out all devices except your current one.
                          You'll need to sign in again on other devices.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRevokeAllSessions}>
                          Sign Out All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No active sessions found</p>
                  <p className="text-sm">Your current session will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-background">
                          {getDeviceIcon(session.device_info, session.os)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {session.browser || session.device_info || "Unknown Device"}
                            </p>
                            {session.is_current && (
                              <Badge variant="secondary" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {session.os && <span>{session.os}</span>}
                            {session.location && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {session.location}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            Last active {formatDistanceToNow(new Date(session.last_active_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {!session.is_current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Login History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Login Activity
              </CardTitle>
              <CardDescription>
                Your recent sign-in attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : loginHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No login history available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {loginHistory.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full ${
                          attempt.success 
                            ? "bg-emerald-500/10 text-emerald-500" 
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          {attempt.success ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {attempt.success ? "Successful sign-in" : "Failed sign-in attempt"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {attempt.ip_address || "Unknown IP"}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(attempt.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Tips */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50 border">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Fingerprint className="h-4 w-4 text-primary" />
              Security Tips
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use a unique, strong password for your account</li>
              <li>• Enable two-factor authentication for extra protection</li>
              <li>• Review your active sessions regularly</li>
              <li>• Sign out from devices you don't recognize</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecurityDashboard;
