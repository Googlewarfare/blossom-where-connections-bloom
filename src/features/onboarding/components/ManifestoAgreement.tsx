import { useState } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Heart, MessageCircle, Users, Shield, Sparkles } from "lucide-react";

interface ManifestoAgreementProps {
  onAgree: () => void;
  agreed: boolean;
}

const COMMITMENTS = [
  {
    id: "no_ghosting",
    icon: MessageCircle,
    title: "I commit to no ghosting",
    description: "I will always respond or close conversations with care. Silence is not closure.",
  },
  {
    id: "respectful_closure",
    icon: Heart,
    title: "I will close conversations with kindness",
    description: "When I'm not feeling a connection, I'll communicate that honestly and compassionately.",
  },
  {
    id: "limited_connections",
    icon: Users,
    title: "I understand I can only pursue 3 people at once",
    description: "Quality over quantity. I'll give my full attention to a small number of connections.",
  },
  {
    id: "safety_first",
    icon: Shield,
    title: "I prioritize safety and respect",
    description: "I will treat everyone with dignity and report any behavior that makes others unsafe.",
  },
];

export function ManifestoAgreement({ onAgree, agreed }: ManifestoAgreementProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const allChecked = COMMITMENTS.every((c) => checkedItems[c.id]);

  const handleCheck = (id: string, checked: boolean) => {
    const newChecked = { ...checkedItems, [id]: checked };
    setCheckedItems(newChecked);
    
    // If all are checked, notify parent
    if (COMMITMENTS.every((c) => newChecked[c.id])) {
      onAgree();
    }
  };

  return (
    <motion.div
      key="manifesto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">The Blossom Promise</span>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Dating, without the games</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Blossom is different by design. Before you continue, we ask that you 
            commit to these principles. They protect everyone — including you.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {COMMITMENTS.map((commitment, index) => (
          <motion.div
            key={commitment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
              checkedItems[commitment.id] 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            }`}
          >
            <Checkbox
              id={commitment.id}
              checked={checkedItems[commitment.id] || false}
              onCheckedChange={(checked) => handleCheck(commitment.id, checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <commitment.icon className={`w-4 h-4 ${
                  checkedItems[commitment.id] ? "text-primary" : "text-muted-foreground"
                }`} />
                <Label 
                  htmlFor={commitment.id} 
                  className="font-medium cursor-pointer"
                >
                  {commitment.title}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {commitment.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {!allChecked && (
        <p className="text-center text-sm text-muted-foreground">
          Please agree to all commitments to continue
        </p>
      )}

      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground italic">
          "Blossom isn't for everyone — and that's intentional."
        </p>
      </div>
    </motion.div>
  );
}
