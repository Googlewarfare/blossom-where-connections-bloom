import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Sparkles, Shield, AlertCircle } from "lucide-react";

interface IntentQuestionsProps {
  answers: Record<string, string>;
  onChange: (key: string, value: string) => void;
  errors?: Record<string, string>;
  minChars?: number;
}

const INTENT_PROMPTS = [
  {
    key: "hoping_to_build",
    question: "What are you hoping to build right now?",
    placeholder: "A meaningful connection with someone who shares my values...",
    icon: Heart,
    hint: "This helps us understand your relationship goals",
  },
  {
    key: "pattern_to_leave",
    question: "What dating pattern are you trying to leave behind?",
    placeholder: "I want to stop rushing into things without really knowing someone...",
    icon: Sparkles,
    hint: "Reflection helps attract the right connections",
  },
  {
    key: "showing_up",
    question: "What does showing up look like to you?",
    placeholder: "Being present, honest, and consistent in how I communicate...",
    icon: Shield,
    hint: "Intentionality is at the heart of Blossom",
  },
];

export function IntentQuestions({ 
  answers, 
  onChange, 
  errors = {}, 
  minChars = 50 
}: IntentQuestionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <p className="text-muted-foreground text-sm">
          These questions help us understand you better. Your answers are{" "}
          <span className="text-foreground font-medium">private by default</span>.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Please write at least {minChars} characters for each answer.
        </p>
      </div>

      {INTENT_PROMPTS.map((prompt, index) => {
        const charCount = (answers[prompt.key] || "").length;
        const hasError = errors[prompt.key];
        const isValid = charCount >= minChars;
        
        return (
          <motion.div
            key={prompt.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                isValid ? "bg-primary/10" : "bg-muted"
              }`}>
                <prompt.icon className={`w-4 h-4 ${
                  isValid ? "text-primary" : "text-muted-foreground"
                }`} />
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-base font-medium leading-relaxed">
                  {prompt.question} *
                </Label>
                <Textarea
                  value={answers[prompt.key] || ""}
                  onChange={(e) => onChange(prompt.key, e.target.value)}
                  placeholder={prompt.placeholder}
                  rows={3}
                  className={`resize-none ${hasError ? "border-destructive" : ""}`}
                  maxLength={500}
                  aria-invalid={!!hasError}
                />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {hasError ? (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {hasError}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{prompt.hint}</p>
                    )}
                  </div>
                  <p className={`text-xs ${
                    isValid 
                      ? "text-primary" 
                      : charCount > 0 
                        ? "text-amber-500" 
                        : "text-muted-foreground"
                  }`}>
                    {charCount}/{minChars} min
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground italic">
          "Your answers stay private. They help Blossom understand your intentions."
        </p>
      </div>
    </motion.div>
  );
}

export { INTENT_PROMPTS };
