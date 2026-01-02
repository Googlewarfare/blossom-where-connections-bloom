import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Suspense } from "react";
import { PageTransition } from "./PageTransition";
import { usePageTracking } from "@/hooks/use-analytics";
import { PageSkeleton } from "./ui/page-skeleton";
import { RequireAuth, RequireOnboarding, RequireAdmin, RequireManifesto } from "@/app/router";

// Import lazily-loaded routes from centralized route config
import {
  Index,
  Auth,
  Profile,
  Discover,
  Matches,
  Chat,
  Activity,
  Onboarding,
  Analytics,
  NotFound,
  SuccessStories,
  Events,
  Verification,
  AdminVerification,
  AdminReports,
  AdminAuditLogs,
  AdminDashboard,
  Premium,
  SafetyCenter,
  SafetyDisclaimer,
  About,
  PrivacyPolicy,
  TermsOfService,
  Support,
  CommunityGuidelines,
  PrivacyLabels,
  Settings,
  PrivacySettings,
  SecurityDashboard,
} from "@/app/router/routes";

export const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Track page views for analytics
  usePageTracking();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageSkeleton />}>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
          <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
          <Route path="/community-guidelines" element={<PageTransition><CommunityGuidelines /></PageTransition>} />
          <Route path="/privacy-labels" element={<PageTransition><PrivacyLabels /></PageTransition>} />
          <Route path="/success-stories" element={<PageTransition><SuccessStories /></PageTransition>} />
          <Route path="/safety" element={<PageTransition><SafetyDisclaimer /></PageTransition>} />
          
          {/* Auth required - onboarding flow */}
          <Route path="/onboarding" element={
            <RequireAuth>
              <PageTransition><Onboarding /></PageTransition>
            </RequireAuth>
          } />
          
          {/* Auth required - profile requires manifesto agreement */}
          <Route path="/profile" element={
            <RequireAuth>
              <RequireManifesto>
                <PageTransition><Profile /></PageTransition>
              </RequireManifesto>
            </RequireAuth>
          } />
          <Route path="/verification" element={
            <RequireAuth>
              <PageTransition><Verification /></PageTransition>
            </RequireAuth>
          } />
          <Route path="/premium" element={
            <RequireAuth>
              <PageTransition><Premium /></PageTransition>
            </RequireAuth>
          } />
          <Route path="/settings" element={
            <RequireAuth>
              <PageTransition><Settings /></PageTransition>
            </RequireAuth>
          } />
          <Route path="/settings/privacy" element={
            <RequireAuth>
              <PageTransition><PrivacySettings /></PageTransition>
            </RequireAuth>
          } />
          <Route path="/settings/security" element={
            <RequireAuth>
              <PageTransition><SecurityDashboard /></PageTransition>
            </RequireAuth>
          } />
          <Route path="/analytics" element={
            <RequireAuth>
              <PageTransition><Analytics /></PageTransition>
            </RequireAuth>
          } />
          <Route path="/safety-center" element={
            <RequireAuth>
              <PageTransition><SafetyCenter /></PageTransition>
            </RequireAuth>
          } />
          
          {/* Auth + onboarding required - core app features */}
          <Route path="/discover" element={
            <RequireAuth>
              <RequireOnboarding>
                <PageTransition><Discover /></PageTransition>
              </RequireOnboarding>
            </RequireAuth>
          } />
          <Route path="/matches" element={
            <RequireAuth>
              <RequireOnboarding>
                <PageTransition><Matches /></PageTransition>
              </RequireOnboarding>
            </RequireAuth>
          } />
          <Route path="/chat" element={
            <RequireAuth>
              <RequireOnboarding>
                <PageTransition><Chat /></PageTransition>
              </RequireOnboarding>
            </RequireAuth>
          } />
          <Route path="/activity" element={
            <RequireAuth>
              <RequireOnboarding>
                <PageTransition><Activity /></PageTransition>
              </RequireOnboarding>
            </RequireAuth>
          } />
          <Route path="/events" element={
            <RequireAuth>
              <RequireOnboarding>
                <PageTransition><Events /></PageTransition>
              </RequireOnboarding>
            </RequireAuth>
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <RequireAdmin>
              <PageTransition><AdminDashboard /></PageTransition>
            </RequireAdmin>
          } />
          <Route path="/admin/verification" element={
            <RequireAdmin>
              <PageTransition><AdminVerification /></PageTransition>
            </RequireAdmin>
          } />
          <Route path="/admin/reports" element={
            <RequireAdmin>
              <PageTransition><AdminReports /></PageTransition>
            </RequireAdmin>
          } />
          <Route path="/admin/audit-logs" element={
            <RequireAdmin>
              <PageTransition><AdminAuditLogs /></PageTransition>
            </RequireAdmin>
          } />
          
          {/* 404 */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};
