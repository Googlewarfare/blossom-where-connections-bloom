import type { CapacitorConfig } from "@capacitor/cli";

// For App Store builds you typically want the bundled web assets (webDir: 'dist').
// If you *explicitly* want to load a remote URL during development, set:
//   CAPACITOR_USE_REMOTE=true
const useRemote = process.env.CAPACITOR_USE_REMOTE === "true";
const remoteUrl =
  "https://83c9e8a9-9a41-4ffa-abb0-41590982157d.lovableproject.com?forceHideBadge=true";

const config: CapacitorConfig = {
  appId: "app.lovable.83c9e8a99a414ffaabb041590982157d",
  appName: "Blossom Dating",
  webDir: "dist",
  ...(useRemote
    ? {
        server: {
          url: remoteUrl,
          cleartext: true,
          allowNavigation: [
            "83c9e8a9-9a41-4ffa-abb0-41590982157d.lovableproject.com",
            "*.lovableproject.com",
          ],
        },
      }
    : {}),
  plugins: {
    SplashScreen: {
      // Duration settings
      launchShowDuration: 2500,
      launchAutoHide: false, // We hide manually after app loads
      launchFadeOutDuration: 500,
      
      // Appearance
      backgroundColor: "#FBD5D5", // Blossom pink - matches launch storyboard
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      
      // Android-specific
      androidSpinnerStyle: "small",
      androidScaleType: "CENTER_CROP",
      
      // iOS-specific - uses LaunchScreen.storyboard
      iosSpinnerStyle: "small",
      useDialog: false, // Use native launch screen on iOS
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
