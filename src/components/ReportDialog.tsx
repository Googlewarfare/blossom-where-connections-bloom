import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flag, AlertTriangle, Loader2 } from "lucide-react";

interface ReportDialogProps {
  reportedUserId: string;
  reportedUserName?: string;
  trigger?: React.ReactNode;
}

const REPORT_CATEGORIES = [
  {
    value: "fake_profile",
    label: "Fake Profile",
    description: "This profile appears to be fake or impersonating someone",
  },
  {
    value: "inappropriate_photos",
    label: "Inappropriate Photos",
    description: "Profile contains inappropriate or explicit content",
  },
  {
    value: "harassment",
    label: "Harassment",
    description: "This user has harassed or threatened me",
  },
  {
    value: "spam",
    label: "Spam",
    description: "This profile is sending spam messages",
  },
  {
    value: "scam",
    label: "Scam/Fraud",
    description: "This user is trying to scam or defraud others",
  },
  {
    value: "underage",
    label: "Underage User",
    description: "This user appears to be under 18 years old",
  },
  {
    value: "other",
    label: "Other",
    description: "Other safety concern not listed above",
  },
] as const;

export const ReportDialog = ({
  reportedUserId,
  reportedUserName,
  trigger,
}: ReportDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to report a user");
      return;
    }

    if (!category) {
      toast.error("Please select a reason for reporting");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        category: category as
          | "fake_profile"
          | "inappropriate_photos"
          | "harassment"
          | "spam"
          | "scam"
          | "underage"
          | "other",
        description: description.trim() || null,
      });

      if (error) throw error;

      toast.success("Report submitted", {
        description:
          "Thank you for helping keep our community safe. We'll review this report shortly.",
      });
      setOpen(false);
      setCategory("");
      setDescription("");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            <Flag className="h-4 w-4 mr-1" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report {reportedUserName ? reportedUserName : "User"}
          </DialogTitle>
          <DialogDescription>
            Help us keep the community safe. Your report will be reviewed by our
            team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">What's the issue?</Label>
            <RadioGroup
              value={category}
              onValueChange={setCategory}
              className="space-y-2"
            >
              {REPORT_CATEGORIES.map((cat) => (
                <div
                  key={cat.value}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setCategory(cat.value)}
                >
                  <RadioGroupItem
                    value={cat.value}
                    id={cat.value}
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor={cat.value}
                      className="font-medium cursor-pointer"
                    >
                      {cat.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {cat.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional context that might help us investigate..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!category || isSubmitting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
