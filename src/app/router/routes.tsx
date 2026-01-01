import { lazy } from "react";

// Eagerly load the main landing page for fast initial load
import Index from "@/pages/Index";

// Lazy load all other pages for code splitting
export const Auth = lazy(() => import("@/pages/Auth"));
export const Profile = lazy(() => import("@/pages/Profile"));
export const Discover = lazy(() => import("@/pages/Discover"));
export const Matches = lazy(() => import("@/pages/Matches"));
export const Chat = lazy(() => import("@/pages/Chat"));
export const Activity = lazy(() => import("@/pages/Activity"));
export const Onboarding = lazy(() => import("@/pages/Onboarding"));
export const Analytics = lazy(() => import("@/pages/Analytics"));
export const NotFound = lazy(() => import("@/pages/NotFound"));
export const SuccessStories = lazy(() => import("@/pages/SuccessStories"));
export const Events = lazy(() => import("@/pages/Events"));
export const Verification = lazy(() => import("@/pages/Verification"));
export const AdminVerification = lazy(() => import("@/pages/AdminVerification"));
export const AdminReports = lazy(() => import("@/pages/AdminReports"));
export const AdminAuditLogs = lazy(() => import("@/pages/AdminAuditLogs"));
export const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
export const Premium = lazy(() => import("@/pages/Premium"));
export const Safety = lazy(() => import("@/pages/Safety"));
export const About = lazy(() => import("@/pages/About"));
export const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
export const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
export const Support = lazy(() => import("@/pages/Support"));
export const CommunityGuidelines = lazy(() => import("@/pages/CommunityGuidelines"));
export const PrivacyLabels = lazy(() => import("@/pages/PrivacyLabels"));
export const Settings = lazy(() => import("@/pages/Settings"));
export const PrivacySettings = lazy(() => import("@/pages/PrivacySettings"));
export const SecurityDashboard = lazy(() => import("@/pages/SecurityDashboard"));

// Re-export Index for consistency
export { Index };

/**
 * Route configuration with metadata.
 * This can be extended for role-based access, analytics, etc.
 */
export interface RouteConfig {
  path: string;
  requiresAuth: boolean;
  requiresOnboarding: boolean;
  requiresManifesto: boolean;
  requiresAdmin: boolean;
  isPublic: boolean;
}

export const routeConfigs: RouteConfig[] = [
  // Public routes
  { path: "/", requiresAuth: false, requiresOnboarding: false, requiresManifesto: false, requiresAdmin: false, isPublic: true },
  { path: "/auth", requiresAuth: false, requiresOnboarding: false, requiresManifesto: false, requiresAdmin: false, isPublic: true },
  { path: "/about", requiresAuth: false, requiresOnboarding: false, requiresManifesto: false, requiresAdmin: false, isPublic: true },
  { path: "/privacy", requiresAuth: false, requiresOnboarding: false, requiresManifesto: false, requiresAdmin: false, isPublic: true },
  { path: "/terms", requiresAuth: false, requiresOnboarding: false, requiresManifesto: false, requiresAdmin: false, isPublic: true },
  { path: "/support", requiresAuth: false, requiresOnboarding: false, requiresManifesto: false, requiresAdmin: false, isPublic: true },
  { path: "/community-guidelines", requiresAuth: false, requiresOnboarding: false, requiresManifesto: false, requiresAdmin: false, isPublic: true },
  { path: "/privacy-labels", requiresAuth: false, requiresOnboarding: false, requiresManifesto: false, requiresAdmin: false, isPublic: true },
  { path: "/success-stories", requiresAuth: false, requiresOnboarding: false, requiresManifesto: false, requiresAdmin: false, isPublic: true },
  { path: "/safety", requiresAuth: false, requiresOnboarding: false, requiresManifesto: false, requiresAdmin: false, isPublic: true },
  
  // Auth required routes (onboarding)
  { path: "/onboarding", requiresAuth: true, requiresOnboarding: false, requiresManifesto: false, requiresAdmin: false, isPublic: false },
  
  // Auth + manifesto required routes (profile access blocked without manifesto)
  { path: "/profile", requiresAuth: true, requiresOnboarding: false, requiresManifesto: true, requiresAdmin: false, isPublic: false },
  
  // Auth + onboarding required routes
  { path: "/discover", requiresAuth: true, requiresOnboarding: true, requiresManifesto: true, requiresAdmin: false, isPublic: false },
  { path: "/matches", requiresAuth: true, requiresOnboarding: true, requiresManifesto: true, requiresAdmin: false, isPublic: false },
  { path: "/chat", requiresAuth: true, requiresOnboarding: true, requiresManifesto: true, requiresAdmin: false, isPublic: false },
  { path: "/activity", requiresAuth: true, requiresOnboarding: true, requiresManifesto: true, requiresAdmin: false, isPublic: false },
  { path: "/events", requiresAuth: true, requiresOnboarding: true, requiresManifesto: true, requiresAdmin: false, isPublic: false },
  { path: "/verification", requiresAuth: true, requiresOnboarding: false, requiresManifesto: true, requiresAdmin: false, isPublic: false },
  { path: "/premium", requiresAuth: true, requiresOnboarding: false, requiresManifesto: true, requiresAdmin: false, isPublic: false },
  { path: "/settings", requiresAuth: true, requiresOnboarding: false, requiresManifesto: true, requiresAdmin: false, isPublic: false },
  { path: "/settings/privacy", requiresAuth: true, requiresOnboarding: false, requiresManifesto: true, requiresAdmin: false, isPublic: false },
  { path: "/settings/security", requiresAuth: true, requiresOnboarding: false, requiresManifesto: true, requiresAdmin: false, isPublic: false },
  { path: "/analytics", requiresAuth: true, requiresOnboarding: false, requiresManifesto: true, requiresAdmin: false, isPublic: false },
  
  // Admin routes
  { path: "/admin", requiresAuth: true, requiresOnboarding: false, requiresManifesto: true, requiresAdmin: true, isPublic: false },
  { path: "/admin/verification", requiresAuth: true, requiresOnboarding: false, requiresManifesto: true, requiresAdmin: true, isPublic: false },
  { path: "/admin/reports", requiresAuth: true, requiresOnboarding: false, requiresManifesto: true, requiresAdmin: true, isPublic: false },
  { path: "/admin/audit-logs", requiresAuth: true, requiresOnboarding: false, requiresManifesto: true, requiresAdmin: true, isPublic: false },
];
