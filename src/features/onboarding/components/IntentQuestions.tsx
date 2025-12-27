import { useState } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Sparkles, Shield } from "lucide-react";

interface IntentQuestionsProps {
  answers: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const INTENT_PROMPTS = [
  {
    key: "hoping_to_build",
    question: "What are you genuinely hoping to build right now?",
    placeholder: "A meaningful connection with someone who shares my values...",
    icon: Heart,
    hint: "This helps us understand your relationship goals",
  },
  {
    key: "pattern_to_break",
    question: "What pattern in dating are you trying to break?",
    placeholder: "I want to stop rushing into things without really knowing someone...",
    icon: Sparkles,
    hint: "Reflection helps attract the right connections",
  },
  {
    key: "feeling_safe",
    question: "What does feeling safe in a relationship mean to you?",
    placeholder: "Being able to be myself without judgment...",
    icon: Shield,
    hint: "Safety is at the heart of Blossom",
  },
];

export function IntentQuestions({ answers, onChange }: IntentQuestionsProps) {
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
      </div>

      {INTENT_PROMPTS.map((prompt, index) => (
        <motion.div
          key={prompt.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-2"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <prompt.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-base font-medium leading-relaxed">
                {prompt.question}
              </Label>
              <Textarea
                value={answers[prompt.key] || ""}
                onChange={(e) => onChange(prompt.key, e.target.value)}
                placeholder={prompt.placeholder}
                rows={3}
                className="resize-none"
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">{prompt.hint}</p>
                <p className="text-xs text-muted-foreground">
                  {(answers[prompt.key] || "").length}/500
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export { INTENT_PROMPTS };
