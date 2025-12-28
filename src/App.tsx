import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { VideoCallProvider } from "./components/VideoCallProvider";
import { AnimatedRoutes } from "./components/AnimatedRoutes";
import { SkipLink } from "./components/ui/skip-link";
import { SessionTimeoutProvider } from "./components/SessionTimeoutProvider";
import { OfflineFallback } from "./components/OfflineFallback";
import { NetworkStatusBanner } from "./components/NetworkStatusBanner";
import { useDeepLinks } from "./hooks/use-deep-links";
import { PushNotificationPrompt } from "./components/PushNotificationPrompt";
import { AppRatingPrompt } from "./components/AppRatingPrompt";
import ErrorBoundary from "./components/ErrorBoundary";
import { BottomNav } from "./components/BottomNav";
import { GhostingBlocker } from "./components/GhostingBlocker";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const DeepLinkHandler = () => {
  useDeepLinks();
  return null;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <VideoCallProvider>
          <TooltipProvider>
            <SkipLink />
            <Toaster />
            <Sonner />
            <NetworkStatusBanner />
            <OfflineFallback />
            <PushNotificationPrompt />
            <AppRatingPrompt />
            <BrowserRouter>
              <DeepLinkHandler />
              <SessionTimeoutProvider>
                <GhostingBlocker>
                  <main id="main-content" className="safe-area-inset min-h-[100dvh] w-full pb-bottom-nav">
                    <AnimatedRoutes />
                  </main>
                  <BottomNav />
                </GhostingBlocker>
              </SessionTimeoutProvider>
            </BrowserRouter>
          </TooltipProvider>
        </VideoCallProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
