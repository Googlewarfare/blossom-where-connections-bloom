/**
 * Auth Feature Module
 * 
 * Handles user authentication, session management, and security.
 */

// Auth provider and hooks
export { AuthProvider, useAuth, PREMIUM_FEATURES, PREMIUM_PRICE_ID } from "@/lib/auth";

// Auth page
export { default as AuthPage } from "@/pages/Auth";

// Auth-related components
export { TwoFactorSetup } from "@/components/TwoFactorSetup";
export { TwoFactorVerify } from "@/components/TwoFactorVerify";
export { PasswordStrengthMeter, isPasswordStrong } from "@/components/PasswordStrengthMeter";
export { BiometricPermissionPrompt } from "@/components/BiometricPermissionPrompt";
export { SessionTimeoutProvider } from "@/components/SessionTimeoutProvider";
