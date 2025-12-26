# Splash Screen Setup Guide

This guide explains how to configure splash screens for iOS and Android.

## Current Configuration

The `capacitor.config.ts` already includes splash screen settings:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    launchAutoHide: true,
    backgroundColor: "#FBD5D5",  // Blossom pink
    showSpinner: false,
    androidScaleType: "CENTER_CROP",
    splashFullScreen: true,
    splashImmersive: true,
  },
}
```

## Source Image

Use `src/assets/splash-screen.png` or create a new one.

**Requirements:**

- 2732x2732 pixels (largest iPad size)
- PNG format
- Center the logo/content in a safe zone (inner 1200x1200)

## iOS Setup

### Using Xcode (Recommended)

1. Open `ios/App/App.xcworkspace` in Xcode
2. Select the project → App → General → App Icons and Launch Images
3. Set "Launch Screen File" to `LaunchScreen`
4. Edit `ios/App/App/Base.lproj/LaunchScreen.storyboard`:
   - Add your splash image to Assets
   - Configure the storyboard to display it

### Using Static Images

Create these sizes in `ios/App/App/Assets.xcassets/Splash.imageset/`:

| Device | Size                                                       |
| ------ | ---------------------------------------------------------- |
| iPhone | 1242x2688 (XS Max), 1125x2436 (X/XS), 1242x2208 (6+/7+/8+) |
| iPad   | 2048x2732 (12.9"), 1668x2388 (11"), 1536x2048 (9.7")       |

## Android Setup

### Splash Image

Place your splash image in:

- `android/app/src/main/res/drawable/splash.png`
- Or use `drawable-*` folders for different densities

### Colors (for background)

Edit `android/app/src/main/res/values/styles.xml`:

```xml
<resources>
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
        <item name="android:background">@drawable/splash</item>
    </style>
</resources>
```

### Dark Mode Support

Create `android/app/src/main/res/values-night/styles.xml`:

```xml
<resources>
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
        <item name="android:background">@drawable/splash_dark</item>
    </style>
</resources>
```

And add `drawable/splash_dark.png` for dark mode.

## Code Integration

The splash is automatically hidden when the app loads. This is handled in `src/main.tsx`:

```typescript
import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";

if (Capacitor.isNativePlatform()) {
  SplashScreen.hide().catch(() => {});
}
```

## Advanced: Animated Splash

For animated splash screens on iOS:

1. Create a Lottie animation or video
2. Use the `@capacitor-community/splash-screen` plugin (community plugin)

## After Adding Splash Screens

Sync changes:

```bash
npx cap sync ios
npx cap sync android
```

## Troubleshooting

- **White flash before splash**: Ensure `backgroundColor` in capacitor.config.ts matches your splash background
- **Splash not showing**: Check that `launchShowDuration` > 0
- **Splash stays too long**: Ensure `SplashScreen.hide()` is called after app loads
