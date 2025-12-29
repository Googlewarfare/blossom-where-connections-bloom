import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";

interface SwipeLimitOverlayProps {
  activeCount: number;
  maxConversations: number;
}

export function SwipeLimitOverlay({
  activeCount,
  maxConversations,
}: SwipeLimitOverlayProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
    >
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {activeCount}
            </div>
          </div>
        </div>

        <h2 className="mb-3 text-2xl font-bold">
          Your attention is full
        </h2>

        <p className="mb-4 text-muted-foreground leading-relaxed">
          You're currently nurturing {activeCount} connection{activeCount !== 1 ? "s" : ""}. 
          At Blossom, we believe real connections deserve your full presence.
        </p>

        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Why we do this</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Limiting active conversations to {maxConversations} isn't a restriction — 
            it's protection. For you and the people you're talking to. 
            Depth requires focus.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/chat")}
            className="w-full gap-2"
            size="lg"
          >
            <MessageCircle className="h-5 w-5" />
            Continue your conversations
          </Button>
          
          <p className="text-xs text-muted-foreground">
            When a conversation has run its course, close it with kindness to make room for someone new.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Quality over quantity — always</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
