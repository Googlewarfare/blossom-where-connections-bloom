import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const OfflineFallback = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    // Give time for connection to stabilize
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (navigator.onLine) {
      window.location.reload();
    }
    setIsRetrying(false);
  };

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <WifiOff className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          You're Offline
        </h1>
        <p className="text-muted-foreground mb-8">
          Please check your internet connection and try again.
        </p>
        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          className="min-w-[140px]"
        >
          {isRetrying ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {isRetrying ? "Checking..." : "Try Again"}
        </Button>
      </div>
    </div>
  );
};
