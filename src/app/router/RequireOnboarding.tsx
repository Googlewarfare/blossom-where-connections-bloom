import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import AppLoader from "@/components/AppLoader";

interface RequireOnboardingProps {
  children: ReactNode;
}

/**
 * Route guard that checks if user has completed onboarding.
 * Redirects to onboarding if profile is incomplete.
 */
export function RequireOnboarding({ children }: RequireOnboardingProps) {
  const { user, loading: authLoading } = useAuth();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, bio, age, gender, manifesto_agreed_at")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error checking profile:", error);
          setProfileComplete(false);
        } else {
          // Profile is complete if essential fields AND manifesto agreement are filled
          const isComplete = Boolean(
            profile?.full_name?.trim() &&
            profile?.bio?.trim() &&
            profile?.age &&
            profile?.gender &&
            profile?.manifesto_agreed_at // Must have agreed to manifesto
          );
          setProfileComplete(isComplete);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        setProfileComplete(false);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      checkProfile();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <AppLoader message="Loading profile..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profileComplete === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
