import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, Sparkles } from "lucide-react";
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
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <div className="mx-4 max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-sm font-bold text-destructive-foreground">
              {activeCount}
            </div>
          </div>
        </div>

        <h2 className="mb-3 text-2xl font-bold">
          You've reached your connection limit
        </h2>

        <p className="mb-6 text-muted-foreground">
          At Blossom, we believe in meaningful connections over endless swiping.
          You have {activeCount} active conversation
          {activeCount !== 1 ? "s" : ""} — focus on getting to know them before
          starting new ones.
        </p>

        <div className="mb-6 rounded-lg border border-border/50 bg-muted/30 p-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>
              {maxConversations} active conversations max — quality over
              quantity
            </span>
          </div>
        </div>

        <Button
          onClick={() => navigate("/chat")}
          className="w-full gap-2"
          size="lg"
        >
          <MessageCircle className="h-5 w-5" />
          Go to your conversations
        </Button>
      </div>
    </motion.div>
  );
}
