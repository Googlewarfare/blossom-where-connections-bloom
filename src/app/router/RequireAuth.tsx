import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import AppLoader from "@/components/AppLoader";

interface RequireAuthProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Route guard that requires user authentication.
 * Redirects to login page if user is not authenticated.
 */
export function RequireAuth({ children, redirectTo = "/auth" }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AppLoader message="Checking authentication..." />;
  }

  if (!user) {
    // Save the attempted URL for redirecting after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
