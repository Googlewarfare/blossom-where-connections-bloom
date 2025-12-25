import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.83c9e8a99a414ffaabb041590982157d',
  appName: 'Blossom Dating',
  webDir: 'dist',
  server: {
    url: 'https://83c9e8a9-9a41-4ffa-abb0-41590982157d.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    allowNavigation: [
      '83c9e8a9-9a41-4ffa-abb0-41590982157d.lovableproject.com',
      '*.lovableproject.com',
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#FBD5D5',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
