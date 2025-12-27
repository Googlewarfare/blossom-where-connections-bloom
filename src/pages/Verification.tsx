import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, CheckCircle, Shield, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OptimizedImage } from "@/components/OptimizedImage";

const Verification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] =
    useState<string>("unverified");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkVerificationStatus();
  }, [user]);

  const checkVerificationStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("verification_status, verified")
      .eq("id", user.id)
      .single();

    if (data) {
      setVerificationStatus(data.verification_status || "unverified");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      // Upload verification photo
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/verification-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Update profile with verification request
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          verification_photo_url: fileName,
          verification_status: "pending",
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Verification submitted! ✓",
        description:
          "Your verification request has been submitted. We'll review it within 24-48 hours.",
      });

      setVerificationStatus("pending");
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const renderVerificationForm = () => (
    <>
      <div className="space-y-4">
        <h3 className="font-semibold">Verification Guidelines</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <span>Take a clear selfie showing your face</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <span>Make sure your photo matches your profile pictures</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <span>Photo should be well-lit and in focus</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <span>No filters, sunglasses, or face coverings</span>
          </li>
        </ul>
      </div>

      {!previewUrl ? (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="h-32 flex-col gap-2"
            >
              <Upload className="h-8 w-8" />
              <span>Upload Photo</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                // Open camera
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute("capture", "user");
                  fileInputRef.current.click();
                }
              }}
              className="h-32 flex-col gap-2"
            >
              <Camera className="h-8 w-8" />
              <span>Take Selfie</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border-2 border-primary">
            <OptimizedImage
              src={previewUrl}
              alt="Verification preview"
              className="w-full h-64 object-cover"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="flex-1"
            >
              Retake
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? "Submitting..." : "Submit for Verification"}
            </Button>
          </div>
        </div>
      )}

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your verification photo will only be used to confirm your identity and
          won't be shown on your profile.
        </AlertDescription>
      </Alert>
    </>
  );

  if (verificationStatus === "approved") {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-background">
        <div className="w-full px-4 py-8 max-w-2xl mx-auto box-border">
          <Button
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>

          <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">You're Verified!</h2>
              <p className="text-muted-foreground">
                Your profile has been verified and displays a blue badge.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (verificationStatus === "pending") {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-background">
        <div className="w-full px-4 py-8 max-w-2xl mx-auto box-border">
          <Button
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>

          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold mb-2">Verification Pending</h2>
              <p className="text-muted-foreground mb-4">
                Your verification request is being reviewed. We'll notify you
                once it's complete.
              </p>
              <p className="text-sm text-muted-foreground">
                This usually takes 24-48 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (verificationStatus === "rejected") {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-background">
        <div className="w-full px-4 py-8 max-w-2xl mx-auto box-border">
          <Button
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>

          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Your verification was rejected. Please try again with a clearer
              photo following the guidelines below.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Get Verified
              </CardTitle>
              <CardDescription>
                Increase trust and stand out with a verified badge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderVerificationForm()}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden safe-area-inset bg-background">
      <div className="w-full px-4 py-8 max-w-2xl mx-auto box-border">
        <Button
          variant="ghost"
          onClick={() => navigate("/profile")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Get Verified
            </CardTitle>
            <CardDescription>
              Increase trust and stand out with a verified badge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderVerificationForm()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verification;
