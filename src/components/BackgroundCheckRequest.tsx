import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Shield, ExternalLink, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BackgroundCheckRequest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: backgroundCheck, isLoading } = useQuery({
    queryKey: ["background-check", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("background_checks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const requestCheck = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("background_checks").insert({
        user_id: user.id,
        status: "pending",
        provider: "manual_review",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["background-check"] });
      toast({
        title: "Request Submitted",
        description:
          "Your background check request has been submitted for review.",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusDisplay = () => {
    if (!backgroundCheck) return null;

    switch (backgroundCheck.status) {
      case "passed":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-medium">Verified</span>
          </div>
        );
      case "pending":
      case "in_progress":
        return (
          <div className="flex items-center gap-2 text-amber-600">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Pending Review</span>
          </div>
        );
      case "expired":
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Expired - Renew Required</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-24 bg-muted rounded-lg" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Background Check
        </CardTitle>
        <CardDescription>
          Get verified to increase trust and stand out to potential matches
        </CardDescription>
      </CardHeader>
      <CardContent>
        {backgroundCheck ? (
          <div className="space-y-4">
            {getStatusDisplay()}
            {backgroundCheck.status === "passed" &&
              backgroundCheck.verification_date && (
                <p className="text-sm text-muted-foreground">
                  Verified on{" "}
                  {new Date(
                    backgroundCheck.verification_date,
                  ).toLocaleDateString()}
                </p>
              )}
            {backgroundCheck.status === "expired" && (
              <Button onClick={() => setOpen(true)}>Renew Verification</Button>
            )}
          </div>
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Request Background Check
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Background Check Verification</DialogTitle>
                <DialogDescription>
                  A background check helps build trust with potential matches
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Identity Verification</p>
                      <p className="text-sm text-muted-foreground">
                        Confirm you are who you say you are
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Criminal Record Check</p>
                      <p className="text-sm text-muted-foreground">
                        Basic criminal background screening
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Trusted Badge</p>
                      <p className="text-sm text-muted-foreground">
                        Display a verified badge on your profile
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Background checks are processed by our team and typically
                    take 2-3 business days. Your information is kept
                    confidential and secure.
                  </p>
                </div>

                <Button
                  onClick={() => requestCheck.mutate()}
                  disabled={requestCheck.isPending}
                  className="w-full"
                >
                  {requestCheck.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default BackgroundCheckRequest;
