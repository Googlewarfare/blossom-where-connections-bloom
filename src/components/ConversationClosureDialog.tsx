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
import { Heart, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConversationClosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  otherUserName: string;
  onClosed?: () => void;
}

// Required closure options - non-punitive, emotionally responsible
const CLOSURE_OPTIONS = [
  {
    id: "no_connection",
    message: "I didn't feel the connection I was hoping for, but I wish you the best.",
    label: "I didn't feel the connection",
  },
  {
    id: "not_ready",
    message: "I'm not ready to continue this right now. Thank you for your time and openness.",
    label: "I'm not ready to continue",
  },
  {
    id: "taking_break",
    message: "I'm taking a break from dating to focus on myself. I hope you find what you're looking for.",
    label: "I need a break from dating",
  },
  {
    id: "custom",
    message: "",
    label: "Write my own message",
  },
];

const MIN_CUSTOM_CHARS = 140;

export function ConversationClosureDialog({
  open,
  onOpenChange,
  conversationId,
  otherUserName,
  onClosed,
}: ConversationClosureDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isCustomSelected = selectedOption === "custom";
  const customValid = customMessage.length >= MIN_CUSTOM_CHARS;
  const canSubmit = selectedOption && (!isCustomSelected || customValid);

  const handleClose = async () => {
    if (!user || !selectedOption) return;

    setLoading(true);
    try {
      const option = CLOSURE_OPTIONS.find((o) => o.id === selectedOption);
      const closureMessage = isCustomSelected ? customMessage : option?.message;

      // Update conversation status
      const { error } = await supabase
        .from("conversations")
        .update({
          status: "closed",
          closed_at: new Date().toISOString(),
          closed_by: user.id,
          closure_reason: selectedOption,
          closure_message: closureMessage,
        })
        .eq("id", conversationId);

      if (error) throw error;

      // Update user's response patterns (graceful closure)
      const { data: existingPatterns } = await supabase
        .from("user_response_patterns")
        .select("graceful_closures, total_conversations")
        .eq("user_id", user.id)
        .maybeSingle();

      await supabase
        .from("user_response_patterns")
        .upsert({
          user_id: user.id,
          graceful_closures: (existingPatterns?.graceful_closures || 0) + 1,
          total_conversations: (existingPatterns?.total_conversations || 0) + 1,
          last_calculated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      // Recalculate trust signals
      await supabase.rpc("calculate_trust_signals", { p_user_id: user.id });

      toast({
        title: "Conversation closed with care",
        description: "Thank you for being thoughtful. Your message has been sent.",
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
            Close with kindness
          </DialogTitle>
          <DialogDescription>
            Everyone deserves closure. Choose a message to send 
            {otherUserName ? ` ${otherUserName}` : ""} before closing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup
            value={selectedOption || ""}
            onValueChange={setSelectedOption}
            className="space-y-2"
          >
            {CLOSURE_OPTIONS.map((option) => (
              <div
                key={option.id}
                className={`flex items-start space-x-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                  selectedOption === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedOption(option.id)}
              >
                <RadioGroupItem value={option.id} id={option.id} className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor={option.id} className="text-sm font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  {option.message && option.id !== "custom" && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{option.message}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>

          {isCustomSelected && (
            <div className="space-y-2">
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Write a kind message..."
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <div className="flex justify-between text-xs">
                <span className={!customValid ? "text-amber-500" : "text-primary"}>
                  {!customValid 
                    ? `${MIN_CUSTOM_CHARS - customMessage.length} more characters needed` 
                    : "✓ Ready to send"}
                </span>
                <span className="text-muted-foreground">{customMessage.length}/500</span>
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Your message will be delivered with care. No reply is required.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleClose} 
            disabled={loading || !canSubmit}
            className="gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            {loading ? "Sending..." : "Send & Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
