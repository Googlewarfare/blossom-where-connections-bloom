import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BackgroundCheckBadgeProps {
  status?: 'pending' | 'in_progress' | 'passed' | 'failed' | 'expired' | null;
  size?: 'sm' | 'md' | 'lg';
}

const BackgroundCheckBadge = ({ status, size = 'md' }: BackgroundCheckBadgeProps) => {
  if (!status || status === 'failed') return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const getContent = () => {
    switch (status) {
      case 'passed':
        return {
          icon: <ShieldCheck className={`${sizeClasses[size]} text-green-500`} />,
          text: 'Background Check Verified',
          bgClass: 'bg-green-500/10'
        };
      case 'pending':
      case 'in_progress':
        return {
          icon: <Shield className={`${sizeClasses[size]} text-amber-500`} />,
          text: 'Background Check Pending',
          bgClass: 'bg-amber-500/10'
        };
      case 'expired':
        return {
          icon: <ShieldAlert className={`${sizeClasses[size]} text-muted-foreground`} />,
          text: 'Background Check Expired',
          bgClass: 'bg-muted'
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center justify-center rounded-full p-1 ${content.bgClass}`}>
            {content.icon}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{content.text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BackgroundCheckBadge;