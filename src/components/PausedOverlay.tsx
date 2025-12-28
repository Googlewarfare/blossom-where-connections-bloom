import { Pause, Play, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface PausedOverlayProps {
  onResume: () => void;
}

export function PausedOverlay({ onResume }: PausedOverlayProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl"
    >
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Pause className="w-10 h-10 text-amber-600" />
        </div>

        <h2 className="text-2xl font-bold mb-3">Dating is paused</h2>
        <p className="text-muted-foreground mb-6">
          You're hidden from discovery and can't match with new people right now. 
          Take all the time you need — we'll be here when you're ready.
        </p>

        <div className="space-y-3">
          <Button onClick={onResume} className="w-full" size="lg">
            <Play className="w-4 h-4 mr-2" />
            Resume Dating
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/settings")}
            className="w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            Go to Settings
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          You can still message your existing matches while paused.
        </p>
      </div>
    </motion.div>
  );
}
