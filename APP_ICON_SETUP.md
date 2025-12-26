# App Icon Setup Guide

Complete guide for configuring app icons for iOS and Android native builds.

## Source Image Requirements

| Requirement | Specification |
|-------------|---------------|
| Size | 1024x1024 pixels minimum |
| Format | PNG (no transparency for iOS App Store) |
| Shape | Square |
| Safe Zone | Keep important content within center 80% |

**Source files in this project:**
- `public/app-icon.jpg` - Primary source
- `src/assets/blossom-logo.jpg` - Logo asset

---

## iOS App Icons

### Required Sizes

Place all icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

| Purpose | Size (px) | Scale | Filename |
|---------|-----------|-------|----------|
| iPhone Notification | 40×40 | 2x | `AppIcon-20@2x.png` |
| iPhone Notification | 60×60 | 3x | `AppIcon-20@3x.png` |
| iPhone Settings | 58×58 | 2x | `AppIcon-29@2x.png` |
| iPhone Settings | 87×87 | 3x | `AppIcon-29@3x.png` |
| iPhone Spotlight | 80×80 | 2x | `AppIcon-40@2x.png` |
| iPhone Spotlight | 120×120 | 3x | `AppIcon-40@3x.png` |
| iPhone App | 120×120 | 2x | `AppIcon-60@2x.png` |
| iPhone App | 180×180 | 3x | `AppIcon-60@3x.png` |
| iPad Notification | 20×20 | 1x | `AppIcon-20.png` |
| iPad Notification | 40×40 | 2x | `AppIcon-20@2x~ipad.png` |
| iPad Settings | 29×29 | 1x | `AppIcon-29.png` |
| iPad Settings | 58×58 | 2x | `AppIcon-29@2x~ipad.png` |
| iPad Spotlight | 40×40 | 1x | `AppIcon-40.png` |
| iPad Spotlight | 80×80 | 2x | `AppIcon-40@2x~ipad.png` |
| iPad App | 76×76 | 1x | `AppIcon-76.png` |
| iPad App | 152×152 | 2x | `AppIcon-76@2x.png` |
| iPad Pro App | 167×167 | 2x | `AppIcon-83.5@2x.png` |
| App Store | 1024×1024 | 1x | `AppIcon-1024.png` |

### Contents.json Template

Create/update `ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json`:

```json
{
  "images": [
    { "size": "20x20", "idiom": "iphone", "filename": "AppIcon-20@2x.png", "scale": "2x" },
    { "size": "20x20", "idiom": "iphone", "filename": "AppIcon-20@3x.png", "scale": "3x" },
    { "size": "29x29", "idiom": "iphone", "filename": "AppIcon-29@2x.png", "scale": "2x" },
    { "size": "29x29", "idiom": "iphone", "filename": "AppIcon-29@3x.png", "scale": "3x" },
    { "size": "40x40", "idiom": "iphone", "filename": "AppIcon-40@2x.png", "scale": "2x" },
    { "size": "40x40", "idiom": "iphone", "filename": "AppIcon-40@3x.png", "scale": "3x" },
    { "size": "60x60", "idiom": "iphone", "filename": "AppIcon-60@2x.png", "scale": "2x" },
    { "size": "60x60", "idiom": "iphone", "filename": "AppIcon-60@3x.png", "scale": "3x" },
    { "size": "20x20", "idiom": "ipad", "filename": "AppIcon-20.png", "scale": "1x" },
    { "size": "20x20", "idiom": "ipad", "filename": "AppIcon-20@2x~ipad.png", "scale": "2x" },
    { "size": "29x29", "idiom": "ipad", "filename": "AppIcon-29.png", "scale": "1x" },
    { "size": "29x29", "idiom": "ipad", "filename": "AppIcon-29@2x~ipad.png", "scale": "2x" },
    { "size": "40x40", "idiom": "ipad", "filename": "AppIcon-40.png", "scale": "1x" },
    { "size": "40x40", "idiom": "ipad", "filename": "AppIcon-40@2x~ipad.png", "scale": "2x" },
    { "size": "76x76", "idiom": "ipad", "filename": "AppIcon-76.png", "scale": "1x" },
    { "size": "76x76", "idiom": "ipad", "filename": "AppIcon-76@2x.png", "scale": "2x" },
    { "size": "83.5x83.5", "idiom": "ipad", "filename": "AppIcon-83.5@2x.png", "scale": "2x" },
    { "size": "1024x1024", "idiom": "ios-marketing", "filename": "AppIcon-1024.png", "scale": "1x" }
  ],
  "info": { "version": 1, "author": "xcode" }
}
```

### Xcode Setup

1. Open the project:
   ```bash
   npx cap open ios
   ```
2. Navigate to `App → App → Assets.xcassets → AppIcon`
3. Drag icons into the appropriate slots, or replace files directly

---

## Android App Icons

### Standard Icons

Place icons in `android/app/src/main/res/` folders:

| Folder | Size (px) | DPI |
|--------|-----------|-----|
| `mipmap-mdpi` | 48×48 | 160 |
| `mipmap-hdpi` | 72×72 | 240 |
| `mipmap-xhdpi` | 96×96 | 320 |
| `mipmap-xxhdpi` | 144×144 | 480 |
| `mipmap-xxxhdpi` | 192×192 | 640 |

**Required files in each folder:**
- `ic_launcher.png` - Standard icon
- `ic_launcher_round.png` - Round icon (Android 7.1+)
- `ic_launcher_foreground.png` - Adaptive foreground (Android 8.0+)

### Adaptive Icons (Android 8.0+)

Adaptive icons have separate foreground and background layers.

#### 1. Create Foreground Layer

Size: 432×432 pixels with 66dp safe zone padding
- The visible area is the center 72% of the image
- Content should be within a 288×288 pixel area centered in the image

#### 2. Create Background Layer

Options:
- Solid color (recommended for this app: `#FBD5D5`)
- Gradient drawable
- Image layer

#### 3. Configure Adaptive Icon XML

Create `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

Create `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

#### 4. Define Background Color

Add to `android/app/src/main/res/values/colors.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FBD5D5</color>
</resources>
```

### Android Studio Method (Easiest)

1. Open Android Studio
2. Right-click `res` folder → New → Image Asset
3. Select "Launcher Icons (Adaptive and Legacy)"
4. Configure foreground and background
5. Click Next → Finish

---

## Icon Generation Tools

### Recommended Online Tools

| Tool | URL | Notes |
|------|-----|-------|
| App Icon Generator | https://appicon.co | Free, generates all sizes |
| MakeAppIcon | https://makeappicon.com | Simple interface |
| Icon Kitchen | https://icon.kitchen | Android focus, adaptive icons |
| Figma Plugin | Search "App Icon" | Design + export |

### Command Line (ImageMagick)

```bash
# Install ImageMagick
brew install imagemagick

# Generate iOS icons
convert source.png -resize 180x180 AppIcon-60@3x.png
convert source.png -resize 120x120 AppIcon-60@2x.png
convert source.png -resize 120x120 AppIcon-40@3x.png
convert source.png -resize 80x80 AppIcon-40@2x.png
convert source.png -resize 87x87 AppIcon-29@3x.png
convert source.png -resize 58x58 AppIcon-29@2x.png
convert source.png -resize 60x60 AppIcon-20@3x.png
convert source.png -resize 40x40 AppIcon-20@2x.png
convert source.png -resize 1024x1024 AppIcon-1024.png

# Generate Android icons
convert source.png -resize 48x48 mipmap-mdpi/ic_launcher.png
convert source.png -resize 72x72 mipmap-hdpi/ic_launcher.png
convert source.png -resize 96x96 mipmap-xhdpi/ic_launcher.png
convert source.png -resize 144x144 mipmap-xxhdpi/ic_launcher.png
convert source.png -resize 192x192 mipmap-xxxhdpi/ic_launcher.png
```

---

## Web/PWA Icons

For the web app and PWA, icons are in `public/`:

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 32×32 | Browser tab |
| `favicon.jpg` | 192×192 | PWA icon |
| `app-icon.jpg` | 512×512 | PWA install |

Update `index.html` if needed:

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/app-icon.jpg" />
```

---

## After Adding Icons

Sync changes to native projects:

```bash
npx cap sync ios
npx cap sync android
```

Build and run to verify:

```bash
npx cap run ios
npx cap run android
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Icon not updating | Clean build folder in Xcode/Android Studio |
| Blurry icon | Ensure source is 1024×1024 minimum |
| iOS icon missing | Check Contents.json filenames match |
| Android adaptive icon wrong shape | Verify foreground safe zone |
| Round icon looks cut off | Keep content in center 66% |

### Clean Build Commands

**iOS:**
```bash
cd ios && xcodebuild clean && cd ..
npx cap sync ios
```

**Android:**
```bash
cd android && ./gradlew clean && cd ..
npx cap sync android
```
