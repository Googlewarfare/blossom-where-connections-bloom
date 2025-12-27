/**
 * Onboarding Feature Module
 * 
 * Handles new user profile setup and permission requests.
 */

// Onboarding page
export { default as OnboardingPage } from "@/pages/Onboarding";

// Permission prompts
export { CameraPermissionPrompt } from "@/components/CameraPermissionPrompt";
export { PushNotificationPrompt } from "@/components/PushNotificationPrompt";
// Note: BiometricPermissionPrompt is exported from auth feature

// Profile completion
export { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
export { useProfileCompletion } from "@/hooks/use-profile-completion";
