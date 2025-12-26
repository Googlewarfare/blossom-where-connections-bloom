import { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCamera } from "@/hooks/use-camera";

interface CameraPermissionPromptProps {
  open: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
}

export const CameraPermissionPrompt = ({
  open,
  onClose,
  onPermissionGranted,
}: CameraPermissionPromptProps) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const { requestPermissions, isNative } = useCamera();

  const handleEnableCamera = async () => {
    setIsRequesting(true);
    try {
      const result = await requestPermissions();
      if (result.camera === "granted" || result.photos === "granted") {
        onPermissionGranted();
      }
    } catch (error) {
      console.error("Camera permission request failed:", error);
    } finally {
      setIsRequesting(false);
      onClose();
    }
  };

  if (!isNative) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            Enable Camera Access
          </DialogTitle>
          <DialogDescription className="text-center">
            To add photos to your profile, Blossom needs access to your camera
            and photo library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <p className="text-muted-foreground">
              Take photos directly for your profile
            </p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <p className="text-muted-foreground">
              Choose photos from your library
            </p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <p className="text-muted-foreground">
              Verify your identity with a selfie
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleEnableCamera}
            disabled={isRequesting}
            className="w-full"
          >
            {isRequesting ? "Requesting..." : "Enable Camera"}
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Not Now
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          You can change this later in your device settings.
        </p>
      </DialogContent>
    </Dialog>
  );
};
