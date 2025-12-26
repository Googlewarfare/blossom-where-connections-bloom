# App Icon Setup Guide

This guide explains how to generate and configure app icons for iOS and Android.

## Source Image

Use the existing logo at `public/app-icon.jpg` or `src/assets/blossom-logo.jpg` as your source.

**Requirements:**

- Minimum 1024x1024 pixels
- PNG format (no transparency for iOS App Store icon)
- Square aspect ratio

## Generating Icons

### Option 1: Online Tools (Recommended)

1. **App Icon Generator** - https://appicon.co/
   - Upload your 1024x1024 image
   - Download the generated icon sets for iOS and Android

2. **MakeAppIcon** - https://makeappicon.com/
   - Similar functionality, generates all required sizes

### Option 2: Manual Generation

#### iOS Required Sizes (place in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`)

| Size   | Scale | Filename                     |
| ------ | ----- | ---------------------------- |
| 20pt   | 2x    | AppIcon-20@2x.png (40x40)    |
| 20pt   | 3x    | AppIcon-20@3x.png (60x60)    |
| 29pt   | 2x    | AppIcon-29@2x.png (58x58)    |
| 29pt   | 3x    | AppIcon-29@3x.png (87x87)    |
| 40pt   | 2x    | AppIcon-40@2x.png (80x80)    |
| 40pt   | 3x    | AppIcon-40@3x.png (120x120)  |
| 60pt   | 2x    | AppIcon-60@2x.png (120x120)  |
| 60pt   | 3x    | AppIcon-60@3x.png (180x180)  |
| 1024pt | 1x    | AppIcon-1024.png (1024x1024) |

#### Android Required Sizes (place in `android/app/src/main/res/`)

| Folder         | Size    |
| -------------- | ------- |
| mipmap-mdpi    | 48x48   |
| mipmap-hdpi    | 72x72   |
| mipmap-xhdpi   | 96x96   |
| mipmap-xxhdpi  | 144x144 |
| mipmap-xxxhdpi | 192x192 |

Name the files `ic_launcher.png` and `ic_launcher_round.png` (for round icons).

## Installation Steps

### iOS

1. Open `ios/App/App.xcworkspace` in Xcode
2. Navigate to `Assets.xcassets` → `AppIcon`
3. Drag and drop the generated icons into the appropriate slots
4. Or replace files directly in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Android

1. Copy icon files to respective `mipmap-*` folders in `android/app/src/main/res/`
2. Or use Android Studio: Right-click `res` → New → Image Asset → Configure

## After Adding Icons

Run the following to sync changes:

```bash
npx cap sync ios
npx cap sync android
```

## Adaptive Icons (Android)

For Android 8.0+, create adaptive icons:

1. Create `ic_launcher_foreground.png` (108dp with safe zone)
2. Create `ic_launcher_background.png` or use a solid color
3. Update `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```
