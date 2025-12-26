import { WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiErrorFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export const ApiErrorFallback = ({
  error,
  onRetry,
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
}: ApiErrorFallbackProps) => {
  const isNetworkError = !navigator.onLine || 
    error?.message?.toLowerCase().includes("network") ||
    error?.message?.toLowerCase().includes("fetch");

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {isNetworkError ? (
          <WifiOff className="w-8 h-8 text-muted-foreground" />
        ) : (
          <AlertTriangle className="w-8 h-8 text-muted-foreground" />
        )}
      </div>

      <h3 className="text-lg font-semibold mb-2">
        {isNetworkError ? "No Connection" : title}
      </h3>

      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        {isNetworkError
          ? "Please check your internet connection and try again."
          : description}
      </p>

      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};
