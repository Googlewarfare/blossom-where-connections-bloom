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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <VideoCallProvider>
        <TooltipProvider>
          <SkipLink />
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
