import { useState } from "react";
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
import { Shield, Loader2 } from "lucide-react";

interface TwoFactorVerifyProps {
  factorId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TwoFactorVerify = ({
  factorId,
  onSuccess,
  onCancel,
}: TwoFactorVerifyProps) => {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (code.length !== 6) return;

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
        code,
      });

      if (verifyError) throw verifyError;

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: "Invalid code. Please try again.",
        variant: "destructive",
      });
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && code.length === 6) {
      handleVerify();
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mfa-code" className="sr-only">
            Verification Code
          </Label>
          <Input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            onKeyDown={handleKeyDown}
            className="text-center text-3xl tracking-[0.5em] font-mono"
            autoFocus
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={verifying || code.length !== 6}
            className="flex-1"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Open your authenticator app to view your verification code
        </p>
      </CardContent>
    </Card>
  );
};
