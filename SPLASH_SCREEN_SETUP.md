# Splash Screen Setup Guide

This guide explains how to configure native splash screens for iOS and Android.

## Current Configuration

The `capacitor.config.ts` includes splash screen settings:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2500,
    launchAutoHide: false,
    launchFadeOutDuration: 500,
    backgroundColor: "#FBD5D5",  // Blossom pink
    showSpinner: false,
    splashFullScreen: true,
    splashImmersive: true,
  },
}
```

## iOS Setup (Launch Storyboard)

iOS uses a Launch Storyboard for the native splash screen. This ensures instant display before the web view loads.

### Step 1: Open Xcode Project

```bash
npx cap open ios
```

### Step 2: Add Splash Image to Assets

1. In Xcode, navigate to `App → App → Assets.xcassets`
2. Right-click → "New Image Set" → Name it `SplashLogo`
3. Add your logo image (use `src/assets/blossom-logo.jpg` as source):
   - 1x: 200x200 pixels
   - 2x: 400x400 pixels  
   - 3x: 600x600 pixels

### Step 3: Configure LaunchScreen.storyboard

1. Open `App → App → Base.lproj → LaunchScreen.storyboard`
2. Select the main View
3. In the Attributes Inspector, set Background to Custom Color: `#FBD5D5`
4. Add an Image View:
   - Drag "Image View" from Object Library onto the view
   - Set Image to `SplashLogo`
   - Set Content Mode to "Aspect Fit"
5. Add constraints to center the image:
   - Select the Image View
   - Click "Add New Constraints" (⊞ icon at bottom)
   - Set Width: 200, Height: 200
   - Click "Align" → Check "Horizontally in Container" and "Vertically in Container"
   - Click "Add Constraints"

### Step 4: Set Launch Screen File

1. Select the project (App) in the navigator
2. Select the "App" target → General tab
3. Under "App Icons and Launch Screen":
   - Ensure "Launch Screen Storyboard" is set to `LaunchScreen`

### Step 5: Alternative - Solid Color Only

For a minimal splash with just the brand color:

1. Open `LaunchScreen.storyboard`
2. Delete any existing views
3. Add a new View that fills the entire safe area
4. Set its background color to `#FBD5D5`
5. Done - clean, fast, and on-brand

## Android Setup

### Step 1: Add Splash Drawable

Create `android/app/src/main/res/drawable/splash.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background"/>
    <item
        android:width="200dp"
        android:height="200dp"
        android:gravity="center"
        android:drawable="@drawable/splash_logo"/>
</layer-list>
```

### Step 2: Add Colors

Add to `android/app/src/main/res/values/colors.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="splash_background">#FBD5D5</color>
</resources>
```

### Step 3: Add Logo

Place your logo at `android/app/src/main/res/drawable/splash_logo.png`

For different densities:
- `drawable-mdpi`: 150x150
- `drawable-hdpi`: 225x225
- `drawable-xhdpi`: 300x300
- `drawable-xxhdpi`: 450x450
- `drawable-xxxhdpi`: 600x600

### Step 4: Update Styles

Edit `android/app/src/main/res/values/styles.xml`:

```xml
<resources>
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
        <item name="android:background">@drawable/splash</item>
        <item name="android:windowBackground">@drawable/splash</item>
    </style>
</resources>
```

### Step 5: Dark Mode Support (Optional)

Create `android/app/src/main/res/values-night/colors.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="splash_background">#1A1A1A</color>
</resources>
```

## Code Integration

The splash is hidden programmatically after the app loads. This is handled in `src/main.tsx`:

```typescript
import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";

if (Capacitor.isNativePlatform()) {
  setTimeout(() => {
    SplashScreen.hide().catch(() => {});
  }, 100);
}
```

## Source Images

| File | Purpose | Recommended Size |
|------|---------|------------------|
| `src/assets/splash-screen.png` | Full splash (for generation tools) | 2732x2732 |
| `src/assets/blossom-logo.jpg` | Logo only (for storyboard) | 600x600+ |
| `public/app-icon.jpg` | App icon source | 1024x1024 |

## After Making Changes

Sync your changes:

```bash
npx cap sync ios
npx cap sync android
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| White flash before splash | Ensure `backgroundColor` matches storyboard |
| Splash not showing | Check `launchShowDuration` > 0 |
| Splash stays too long | Verify `SplashScreen.hide()` is called |
| Logo looks pixelated | Use higher resolution images (3x) |
| Constraints warning in Xcode | Reset constraints on the image view |

## iOS-Specific Notes

- iOS requires Launch Storyboard (not static images) for App Store submission
- The storyboard is displayed by iOS before your app code runs
- Keep the design simple - complex layouts may cause delays
- Test on multiple device sizes to ensure proper scaling
