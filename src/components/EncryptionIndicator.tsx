import { Shield, ShieldCheck, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EncryptionIndicatorProps {
  variant?: 'badge' | 'inline' | 'compact';
  className?: string;
}

export function EncryptionIndicator({ variant = 'badge', className = '' }: EncryptionIndicatorProps) {
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1 text-emerald-600 dark:text-emerald-400 ${className}`}>
              <Lock className="h-3 w-3" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Encrypted Connection
              </p>
              <p className="text-xs text-muted-foreground">
                Your messages are protected with TLS encryption in transit and at rest.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'inline') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 ${className}`}>
              <Lock className="h-3 w-3" />
              <span>Encrypted</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Secure Messaging
              </p>
              <p className="text-xs text-muted-foreground">
                All messages are encrypted during transmission and stored securely. 
                Your conversations are protected from unauthorized access.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-help ${className}`}
          >
            <ShieldCheck className="h-3 w-3" />
            <span className="text-xs">Encrypted</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold flex items-center gap-1">
              <Shield className="h-4 w-4 text-emerald-500" />
              End-to-End Security
            </p>
            <p className="text-xs text-muted-foreground">
              Your messages are protected with industry-standard encryption:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-500" />
                TLS 1.3 encryption in transit
              </li>
              <li className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-500" />
                AES-256 encryption at rest
              </li>
              <li className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Secure database storage
              </li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function MessageEncryptionBanner() {
  return (
    <div className="flex items-center justify-center gap-2 py-2 px-4 bg-emerald-500/5 border-b border-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400">
      <Lock className="h-3 w-3" />
      <span>Messages in this conversation are encrypted and secure</span>
    </div>
  );
}
