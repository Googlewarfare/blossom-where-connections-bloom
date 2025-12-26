import { useState } from "react";
import { Fingerprint, ScanFace, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";

interface BiometricPermissionPromptProps {
  open: boolean;
  onClose: () => void;
  onEnable: (email: string, password: string) => Promise<void>;
  credentials?: { email: string; password: string };
}

export const BiometricPermissionPrompt = ({
  open,
  onClose,
  onEnable,
  credentials,
}: BiometricPermissionPromptProps) => {
  const [isEnabling, setIsEnabling] = useState(false);
  const { biometryType, getBiometryLabel, isNative, isAvailable } = useBiometricAuth();

  const handleEnable = async () => {
    if (!credentials) {
      onClose();
      return;
    }

    setIsEnabling(true);
    try {
      await onEnable(credentials.email, credentials.password);
    } catch (error) {
      console.error("Failed to enable biometric:", error);
    } finally {
      setIsEnabling(false);
      onClose();
    }
  };

  if (!isNative || !isAvailable) return null;

  const Icon = biometryType === "face" ? ScanFace : Fingerprint;
  const biometricLabel = getBiometryLabel();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            Enable {biometricLabel}
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in faster and more securely using {biometricLabel}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3 text-sm">
            <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              Your credentials are stored securely on your device
            </p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              Sign in with just a glance or touch
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleEnable}
            disabled={isEnabling}
            className="w-full"
          >
            {isEnabling ? "Enabling..." : `Enable ${biometricLabel}`}
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          You can disable this anytime in Settings.
        </p>
      </DialogContent>
    </Dialog>
  );
};
