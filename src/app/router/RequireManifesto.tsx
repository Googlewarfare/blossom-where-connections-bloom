import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import AppLoader from "@/components/AppLoader";

interface RequireManifestoProps {
  children: ReactNode;
}

/**
 * Route guard that enforces Manifesto agreement.
 * Redirects to onboarding if user has NOT agreed to the manifesto.
 * This is a mission-critical guard - no profile access without manifesto agreement.
 */
export function RequireManifesto({ children }: RequireManifestoProps) {
  const { user, loading: authLoading } = useAuth();
  const [manifestoAgreed, setManifestoAgreed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkManifestoAgreement() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("manifesto_agreed_at")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error checking manifesto agreement:", error);
          setManifestoAgreed(false);
        } else {
          // User must have explicitly agreed to manifesto
          setManifestoAgreed(Boolean(profile?.manifesto_agreed_at));
        }
      } catch (error) {
        console.error("Error checking manifesto agreement:", error);
        setManifestoAgreed(false);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      checkManifestoAgreement();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <AppLoader message="Verifying manifesto agreement..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // MISSION-CRITICAL: Block access if manifesto not agreed
  if (manifestoAgreed === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
