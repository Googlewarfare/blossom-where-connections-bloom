import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const TwoFactorSetup = () => {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const verifiedFactor = data.totp.find((f) => f.status === "verified");
      setIsEnrolled(!!verifiedFactor);
      if (verifiedFactor) {
        setFactorId(verifiedFactor.id);
      }
    } catch (error) {
      console.error("Error checking MFA status:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEnrollment = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Blossom Authenticator",
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to start 2FA enrollment",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const verifyEnrollment = async () => {
    if (!factorId || verificationCode.length !== 6) return;

    setVerifying(true);
    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId,
        });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode,
      });

      if (verifyError) throw verifyError;

      setIsEnrolled(true);
      setQrCode(null);
      setSecret(null);
      setVerificationCode("");

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description:
          error.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const disableMFA = async () => {
    if (!factorId || disableCode.length !== 6) return;

    setDisabling(true);
    try {
      // First verify the code
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId,
        });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: disableCode,
      });

      if (verifyError) throw verifyError;

      // Then unenroll
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (unenrollError) throw unenrollError;

      setIsEnrolled(false);
      setFactorId(null);
      setShowDisableDialog(false);
      setDisableCode("");

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Disable",
        description: error.message || "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDisabling(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const cancelEnrollment = async () => {
    if (factorId) {
      try {
        await supabase.auth.mfa.unenroll({ factorId });
      } catch (e) {
        // Ignore errors when canceling
      }
    }
    setQrCode(null);
    setSecret(null);
    setFactorId(null);
    setVerificationCode("");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <CardTitle>Two-Factor Authentication</CardTitle>
        </div>
        <CardDescription>
          Add an extra layer of security to your account using an authenticator
          app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEnrolled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                2FA is enabled on your account
              </span>
            </div>

            <Dialog
              open={showDisableDialog}
              onOpenChange={setShowDisableDialog}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <ShieldOff className="w-4 h-4 mr-2" />
                  Disable 2FA
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                  <DialogDescription>
                    Enter your authenticator code to confirm disabling 2FA.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="disable-code">Verification Code</Label>
                    <Input
                      id="disable-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      value={disableCode}
                      onChange={(e) =>
                        setDisableCode(e.target.value.replace(/\D/g, ""))
                      }
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>
                  <Button
                    onClick={disableMFA}
                    disabled={disabling || disableCode.length !== 6}
                    variant="destructive"
                    className="w-full"
                  >
                    {disabling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Disabling...
                      </>
                    ) : (
                      "Confirm Disable"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : qrCode ? (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, etc.)
              </p>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              </div>
            </div>

            {secret && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Can't scan? Enter this code manually:
                </Label>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                    {secret}
                  </code>
                  <Button variant="outline" size="icon" onClick={copySecret}>
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verify-code">Enter verification code</Label>
              <Input
                id="verify-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, ""))
                }
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={cancelEnrollment}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={verifyEnrollment}
                disabled={verifying || verificationCode.length !== 6}
                className="flex-1"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Enable 2FA"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <ShieldOff className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                2FA is not enabled on your account
              </span>
            </div>

            <Button
              onClick={startEnrollment}
              disabled={enrolling}
              className="w-full"
            >
              {enrolling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Enable 2FA
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
