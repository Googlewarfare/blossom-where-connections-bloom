import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { PageTransition } from "./PageTransition";
import { usePageTracking } from "@/hooks/use-analytics";
import AppLoader from "./AppLoader";
import { RequireAuth, RequireOnboarding, RequireAdmin, RequireManifesto } from "@/app/router";

// Eagerly load the main landing page for fast initial load
import Index from "@/pages/Index";

// Lazy load all other pages for code splitting
const Auth = lazy(() => import("@/pages/Auth"));
const Profile = lazy(() => import("@/pages/Profile"));
const Discover = lazy(() => import("@/pages/Discover"));
const Matches = lazy(() => import("@/pages/Matches"));
const Chat = lazy(() => import("@/pages/Chat"));
const Activity = lazy(() => import("@/pages/Activity"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const SuccessStories = lazy(() => import("@/pages/SuccessStories"));
const Events = lazy(() => import("@/pages/Events"));
const Verification = lazy(() => import("@/pages/Verification"));
const AdminVerification = lazy(() => import("@/pages/AdminVerification"));
const AdminReports = lazy(() => import("@/pages/AdminReports"));
const AdminAuditLogs = lazy(() => import("@/pages/AdminAuditLogs"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Premium = lazy(() => import("@/pages/Premium"));
const SafetyCenter = lazy(() => import("@/pages/Safety"));
const SafetyDisclaimer = lazy(() => import("@/pages/SafetyDisclaimer"));
const About = lazy(() => import("@/pages/About"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const Support = lazy(() => import("@/pages/Support"));
const CommunityGuidelines = lazy(() => import("@/pages/CommunityGuidelines"));
const PrivacyLabels = lazy(() => import("@/pages/PrivacyLabels"));
const Settings = lazy(() => import("@/pages/Settings"));
const PrivacySettings = lazy(() => import("@/pages/PrivacySettings"));
const SecurityDashboard = lazy(() => import("@/pages/SecurityDashboard"));

// Loading fallback component
const PageLoader = () => <AppLoader message="Loading page..." />;

export const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Track page views for analytics
  usePageTracking();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
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
