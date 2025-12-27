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
import { Flag, AlertTriangle, Loader2, AlertCircle } from "lucide-react";
import { reportSchema, reportCategorySchema, sanitizeString } from "@/lib/validation";
import type { z } from "zod";

interface ReportDialogProps {
  reportedUserId: string;
  reportedUserName?: string;
  trigger?: React.ReactNode;
}

type ReportCategory = z.infer<typeof reportCategorySchema>;

const REPORT_CATEGORIES: { value: ReportCategory; label: string; description: string }[] = [
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
];

const MAX_DESCRIPTION_LENGTH = 2000;

export const ReportDialog = ({
  reportedUserId,
  reportedUserName,
  trigger,
}: ReportDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ReportCategory | "">("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Enforce max length
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(value);
      setError(null);
    }
  };

  const resetForm = () => {
    setCategory("");
    setDescription("");
    setError(null);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to report a user");
      return;
    }

    if (!category) {
      setError("Please select a reason for reporting");
      return;
    }

    // Validate the report data using zod schema
    const validationResult = reportSchema.safeParse({
      reported_user_id: reportedUserId,
      category,
      description: description.trim() || null,
    });

    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    // Additional security check: prevent self-reporting
    if (reportedUserId === user.id) {
      toast.error("You cannot report yourself");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Sanitize description before sending
      const sanitizedDescription = description.trim() 
        ? sanitizeString(description.trim()) 
        : null;

      const { error: insertError } = await supabase.from("reports").insert({
        reporter_id: user.id,
        reported_user_id: validationResult.data.reported_user_id,
        category: validationResult.data.category,
        description: sanitizedDescription,
      });

      if (insertError) throw insertError;

      toast.success("Report submitted", {
        description:
          "Thank you for helping keep our community safe. We'll review this report shortly.",
      });
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error submitting report:", err);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            Report {reportedUserName ? sanitizeString(reportedUserName) : "User"}
          </DialogTitle>
          <DialogDescription>
            Help us keep the community safe. Your report will be reviewed by our
            team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">What's the issue? *</Label>
            <RadioGroup
              value={category}
              onValueChange={(value) => {
                setCategory(value as ReportCategory);
                setError(null);
              }}
              className="space-y-2"
            >
              {REPORT_CATEGORIES.map((cat) => (
                <div
                  key={cat.value}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setCategory(cat.value);
                    setError(null);
                  }}
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
              onChange={handleDescriptionChange}
              rows={3}
              maxLength={MAX_DESCRIPTION_LENGTH}
              aria-describedby="description-hint"
            />
            <p id="description-hint" className="text-xs text-muted-foreground">
              {description.length}/{MAX_DESCRIPTION_LENGTH} characters
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
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
