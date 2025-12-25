import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.googlewarfare.blossom',
  appName: 'Blossom',
  webDir: 'dist',
  server: {
    url: 'https://83c9e8a9-9a41-4ffa-abb0-41590982157d.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;

