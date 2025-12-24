import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VideoCallButtonProps {
  onStartCall: () => void;
  disabled?: boolean;
}

export const VideoCallButton = ({ onStartCall, disabled }: VideoCallButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onStartCall}
            disabled={disabled}
            className="text-primary hover:bg-primary/10"
          >
            <Video className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Start video call</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
