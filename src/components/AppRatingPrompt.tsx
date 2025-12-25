import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, X } from "lucide-react";
import { useAppRating } from "@/hooks/use-app-rating";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppRatingPromptProps {
  trigger?: boolean;
  onComplete?: () => void;
}

export const AppRatingPrompt = ({ trigger = false, onComplete }: AppRatingPromptProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isNative, shouldPromptRating, requestRating, hasBeenPrompted } = useAppRating();

  useEffect(() => {
    if (trigger && shouldPromptRating() && !hasBeenPrompted) {
      setIsOpen(true);
    }
  }, [trigger, shouldPromptRating, hasBeenPrompted]);

  const handleRate = () => {
    requestRating();
    setIsOpen(false);
    onComplete?.();
  };

  const handleMaybeLater = () => {
    setIsOpen(false);
    onComplete?.();
  };

  const handleNeverAsk = () => {
    localStorage.setItem('blossom_rating_prompted', 'true');
    setIsOpen(false);
    onComplete?.();
  };

  if (!isNative) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star 
                key={i} 
                className="w-8 h-8 text-yellow-400 fill-yellow-400" 
              />
            ))}
          </div>
          <DialogTitle className="text-xl">Enjoying Blossom?</DialogTitle>
          <DialogDescription className="text-base">
            Your review helps others find meaningful connections too!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          <Button
            onClick={handleRate}
            className="w-full rounded-full"
            size="lg"
          >
            Rate Blossom
          </Button>
          <Button
            variant="ghost"
            onClick={handleMaybeLater}
            className="w-full"
            size="sm"
          >
            Maybe Later
          </Button>
          <button
            onClick={handleNeverAsk}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Don't ask again
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
