import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Users, Shield, Sparkles, ScrollText, Check } from "lucide-react";

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
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allChecked = COMMITMENTS.every((c) => checkedItems[c.id]);

  // Track scroll position
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      // Consider scrolled to bottom when within 20px of bottom
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setHasScrolledToBottom(true);
      }
    };

    scrollEl.addEventListener("scroll", handleScroll);
    // Check initial state (in case content doesn't need scrolling)
    handleScroll();
    
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCheck = (id: string, checked: boolean) => {
    if (!hasScrolledToBottom) return; // Can't check until scrolled
    setCheckedItems((prev) => ({ ...prev, [id]: checked }));
  };

  const handleConfirm = () => {
    if (allChecked && hasScrolledToBottom) {
      setConfirmed(true);
      onAgree();
    }
  };

  return (
    <motion.div
      key="manifesto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div className="text-center space-y-3">
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

      {/* Scroll indicator */}
      {!hasScrolledToBottom && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 py-2 px-4 rounded-lg"
        >
          <ScrollText className="w-4 h-4" />
          <span>Please read through all commitments</span>
        </motion.div>
      )}

      {/* Scrollable commitments area */}
      <div 
        ref={scrollRef}
        className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin"
      >
        {COMMITMENTS.map((commitment, index) => (
          <motion.div
            key={commitment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
              checkedItems[commitment.id] 
                ? "border-primary bg-primary/5" 
                : hasScrolledToBottom
                  ? "border-border hover:border-primary/50 cursor-pointer"
                  : "border-border opacity-70"
            }`}
            onClick={() => hasScrolledToBottom && handleCheck(commitment.id, !checkedItems[commitment.id])}
          >
            <Checkbox
              id={commitment.id}
              checked={checkedItems[commitment.id] || false}
              onCheckedChange={(checked) => handleCheck(commitment.id, checked as boolean)}
              disabled={!hasScrolledToBottom}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <commitment.icon className={`w-4 h-4 ${
                  checkedItems[commitment.id] ? "text-primary" : "text-muted-foreground"
                }`} />
                <Label 
                  htmlFor={commitment.id} 
                  className={`font-medium ${hasScrolledToBottom ? "cursor-pointer" : "cursor-default"}`}
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

        {/* Bottom quote - ensures scrolling is required */}
        <div className="bg-muted/50 rounded-xl p-4 text-center mt-4">
          <p className="text-sm text-muted-foreground italic">
            "Blossom isn't for everyone — and that's intentional."
          </p>
        </div>
      </div>

      {/* Status message */}
      <div className="text-center">
        {!hasScrolledToBottom ? (
          <p className="text-sm text-muted-foreground">
            Scroll down to read all commitments
          </p>
        ) : !allChecked ? (
          <p className="text-sm text-muted-foreground">
            Check each commitment to continue
          </p>
        ) : confirmed || agreed ? (
          <motion.p 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-primary font-medium flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            You've agreed to the Blossom Promise
          </motion.p>
        ) : null}
      </div>

      {/* Confirm button - only shows after all checked */}
      {allChecked && hasScrolledToBottom && !confirmed && !agreed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            onClick={handleConfirm}
            className="w-full"
            size="lg"
          >
            I Agree to These Commitments
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
