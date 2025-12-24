import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";
import { usePageTracking } from "@/hooks/use-analytics";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Discover from "@/pages/Discover";
import Matches from "@/pages/Matches";
import Chat from "@/pages/Chat";
import Activity from "@/pages/Activity";
import Onboarding from "@/pages/Onboarding";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/NotFound";
import SuccessStories from "@/pages/SuccessStories";
import Events from "@/pages/Events";
import Verification from "@/pages/Verification";
import AdminVerification from "@/pages/AdminVerification";
import AdminReports from "@/pages/AdminReports";
import Premium from "@/pages/Premium";
import Safety from "@/pages/Safety";
import About from "@/pages/About";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Support from "@/pages/Support";

export const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Track page views for analytics
  usePageTracking();

  return (
    <AnimatePresence mode="wait">
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
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};
