import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { PageTransition } from "./PageTransition";
import { usePageTracking } from "@/hooks/use-analytics";
import AppLoader from "./AppLoader";

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
const Premium = lazy(() => import("@/pages/Premium"));
const Safety = lazy(() => import("@/pages/Safety"));
const About = lazy(() => import("@/pages/About"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const Support = lazy(() => import("@/pages/Support"));
const CommunityGuidelines = lazy(() => import("@/pages/CommunityGuidelines"));
const PrivacyLabels = lazy(() => import("@/pages/PrivacyLabels"));
const Settings = lazy(() => import("@/pages/Settings"));

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
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/discover" element={<PageTransition><Discover /></PageTransition>} />
          <Route path="/matches" element={<PageTransition><Matches /></PageTransition>} />
          <Route path="/chat" element={<PageTransition><Chat /></PageTransition>} />
          <Route path="/activity" element={<PageTransition><Activity /></PageTransition>} />
          <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
          <Route path="/success-stories" element={<PageTransition><SuccessStories /></PageTransition>} />
          <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
          <Route path="/verification" element={<PageTransition><Verification /></PageTransition>} />
          <Route path="/admin/verification" element={<PageTransition><AdminVerification /></PageTransition>} />
          <Route path="/admin/reports" element={<PageTransition><AdminReports /></PageTransition>} />
          <Route path="/premium" element={<PageTransition><Premium /></PageTransition>} />
          <Route path="/safety" element={<PageTransition><Safety /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
          <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
          <Route path="/community-guidelines" element={<PageTransition><CommunityGuidelines /></PageTransition>} />
          <Route path="/privacy-labels" element={<PageTransition><PrivacyLabels /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};
