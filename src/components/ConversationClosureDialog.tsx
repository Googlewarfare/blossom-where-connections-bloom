import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Heart, MessageCircle, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClosureTemplate {
  id: string;
  message: string;
  tone: string;
}

interface ConversationClosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  otherUserName: string;
  onClosed?: () => void;
}

export function ConversationClosureDialog({
  open,
  onOpenChange,
  conversationId,
  otherUserName,
  onClosed,
}: ConversationClosureDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ClosureTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [closureType, setClosureType] = useState<"close" | "archive">("close");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase
        .from("closure_templates")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (data) {
        setTemplates(data);
      }
    };

    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const handleClose = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const closureMessage =
        selectedTemplate === "custom"
          ? customMessage
          : templates.find((t) => t.id === selectedTemplate)?.message || null;

      // Update conversation status
      const { error } = await supabase
        .from("conversations")
        .update({
          status: closureType === "close" ? "closed" : "archived",
          closed_at: new Date().toISOString(),
          closed_by: user.id,
          closure_reason: closureType,
          closure_message: closureMessage,
        })
        .eq("id", conversationId);

      if (error) throw error;

      // Update user's response patterns (graceful closure)
      await supabase
        .from("user_response_patterns")
        .upsert(
          {
            user_id: user.id,
            graceful_closures: 1,
            total_conversations: 1,
          },
          { onConflict: "user_id" }
        )
        .select();

      toast({
        title: closureType === "close" ? "Conversation closed" : "Conversation archived",
        description: "Thank you for communicating thoughtfully.",
      });

      onOpenChange(false);
      onClosed?.();
    } catch (error) {
      console.error("Error closing conversation:", error);
      toast({
        title: "Error",
        description: "Failed to close conversation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            End conversation with care
          </DialogTitle>
          <DialogDescription>
            At Blossom, we believe in thoughtful communication. Would you like to send 
            {otherUserName ? ` ${otherUserName}` : " them"} a kind message before closing?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Button
              variant={closureType === "close" ? "default" : "outline"}
              size="sm"
              onClick={() => setClosureType("close")}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Close
            </Button>
            <Button
              variant={closureType === "archive" ? "default" : "outline"}
              size="sm"
              onClick={() => setClosureType("archive")}
              className="flex-1"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
          </div>

          {closureType === "close" && (
            <>
              <p className="text-sm text-muted-foreground">
                Choose a message to send (optional but encouraged):
              </p>

              <RadioGroup
                value={selectedTemplate || ""}
                onValueChange={setSelectedTemplate}
                className="space-y-2"
              >
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem value={template.id} id={template.id} className="mt-0.5" />
                    <Label htmlFor={template.id} className="text-sm font-normal cursor-pointer flex-1">
                      "{template.message}"
                    </Label>
                  </div>
                ))}
                <div
                  className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value="custom" id="custom" className="mt-0.5" />
                  <Label htmlFor="custom" className="text-sm font-normal cursor-pointer">
                    Write your own message
                  </Label>
                </div>
              </RadioGroup>

              {selectedTemplate === "custom" && (
                <div className="space-y-2">
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Write a kind message (minimum 140 characters)..."
                    rows={4}
                    maxLength={500}
                  />
                  <div className="flex justify-between text-xs">
                    <span className={customMessage.length < 140 ? "text-destructive" : "text-muted-foreground"}>
                      {customMessage.length < 140 
                        ? `${140 - customMessage.length} more characters needed` 
                        : "✓ Minimum reached"}
                    </span>
                    <span className="text-muted-foreground">{customMessage.length}/500</span>
                  </div>
                </div>
              )}
            </>
          )}

          {closureType === "archive" && (
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              Archiving hides this conversation without sending a closure message. 
              The other person won't be notified.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleClose} disabled={loading}>
            {loading ? "Processing..." : closureType === "close" ? "Close & Send" : "Archive"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
