import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerificationBadgeProps {
  verified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const VerificationBadge = ({ 
  verified, 
  size = 'md',
  showText = false 
}: VerificationBadgeProps) => {
  if (!verified) return null;

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  if (showText) {
    return (
      <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
        <CheckCircle2 className={iconSize} />
        Verified
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex">
            <CheckCircle2 className={`${iconSize} text-primary fill-primary/20`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Profile</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
