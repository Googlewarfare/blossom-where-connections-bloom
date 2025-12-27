/**
 * Shared Hooks Barrel Export
 * 
 * Re-exports common hooks used across features.
 */

// Toast notifications
export { useToast } from "@/hooks/use-toast";

// Mobile detection
export { useIsMobile } from "@/hooks/use-mobile";

// Native app utilities
export { useNativeApp } from "@/hooks/use-native-app";

// Haptic feedback
export { useHaptics, haptics } from "@/hooks/use-haptics";

// Biometric authentication
export { useBiometricAuth } from "@/hooks/use-biometric-auth";

// Camera access
export { useCamera } from "@/hooks/use-camera";

// Push notifications
export { usePushNotifications } from "@/hooks/use-push-notifications";

// Analytics
export { usePageTracking, useEventTracking } from "@/hooks/use-analytics";

// Security utilities
export { 
  checkAccountLockout,
  recordLoginAttempt,
  checkRateLimit,
  logAuditEvent,
  useSessionTimeout,
  SESSION_TIMEOUT,
  SESSION_WARNING
} from "@/hooks/use-security";

// Password checking
export { checkPasswordBreach } from "@/hooks/use-password-check";

// Deep links
export { useDeepLinks } from "@/hooks/use-deep-links";

// App rating
export { useAppRating } from "@/hooks/use-app-rating";
