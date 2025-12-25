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
import { useDeepLinks } from "./hooks/use-deep-links";
import { PushNotificationPrompt } from "./components/PushNotificationPrompt";
import { AppRatingPrompt } from "./components/AppRatingPrompt";

const queryClient = new QueryClient();

const DeepLinkHandler = () => {
  useDeepLinks();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <VideoCallProvider>
        <TooltipProvider>
          <SkipLink />
          <Toaster />
          <Sonner />
          <OfflineFallback />
          <PushNotificationPrompt />
          <AppRatingPrompt />
          <BrowserRouter>
            <DeepLinkHandler />
            <SessionTimeoutProvider>
              <main id="main-content">
                <AnimatedRoutes />
              </main>
            </SessionTimeoutProvider>
          </BrowserRouter>
        </TooltipProvider>
      </VideoCallProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
