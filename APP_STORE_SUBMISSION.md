# Blossom - App Store Submission Guide

## Prerequisites

1. **Apple Developer Program Membership** ($99/year)
   - Sign up at [developer.apple.com](https://developer.apple.com)
   - Complete the enrollment process (can take 24-48 hours)

2. **Xcode** (latest version from Mac App Store)

3. **Mac computer** (required for iOS builds)

---

## Step 1: Prepare Your Development Environment

### 1.1 Clone and Setup
```bash
# Clone your repository
git clone <your-github-repo-url>
cd <project-folder>

# Install dependencies
npm install

# Add iOS platform (if not already added)
npx cap add ios

# Build and sync
npm run build
npx cap sync ios
```

### 1.2 Open in Xcode
```bash
npx cap open ios
```

---

## Step 2: Configure Signing & Capabilities

### 2.1 In Xcode:
1. Select the **App** project in the navigator
2. Select the **App** target
3. Go to **Signing & Capabilities** tab
4. Check **Automatically manage signing**
5. Select your **Team** (your Apple Developer account)
6. Update **Bundle Identifier** to: `app.lovable.blossom` (or your preferred identifier)

### 2.2 Add Capabilities (if needed):
Click **+ Capability** to add:
- Push Notifications
- Background Modes (Remote notifications, Background fetch)
- Associated Domains (for deep links)

---

## Step 3: App Icons

Your app needs icons in multiple sizes. Current icon is at:
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Required Icon Sizes:
| Size | Purpose |
|------|---------|
| 1024x1024 | App Store |
| 180x180 | iPhone @3x |
| 120x120 | iPhone @2x |
| 167x167 | iPad Pro @2x |
| 152x152 | iPad @2x |
| 76x76 | iPad @1x |
| 40x40 | Spotlight @1x |
| 80x80 | Spotlight @2x |
| 120x120 | Spotlight @3x |

**Tool**: Use [App Icon Generator](https://appicon.co/) to generate all sizes from a 1024x1024 source.

---

## Step 4: App Store Connect Setup

### 4.1 Create App
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Blossom
   - **Primary Language**: English (US)
   - **Bundle ID**: Select your registered bundle ID
   - **SKU**: blossom-dating-app (unique identifier)

### 4.2 App Information

#### App Description (Suggested):
```
Find meaningful connections with Blossom - the dating app designed for authentic relationships.

KEY FEATURES:

💝 Smart Matching
Our intelligent algorithm considers your interests, values, and relationship goals to suggest compatible matches.

✅ Verified Profiles
Feel safe knowing profiles are verified. Our photo verification and background check options help ensure you're meeting real people.

💬 Rich Conversations
Express yourself with text, photos, voice messages, and video calls. Break the ice with our fun conversation starters.

📍 Location-Based Discovery
Find matches near you with our interactive map feature. Set your preferred distance range.

🎉 Events & Community
Join local singles events and meet people in a relaxed, social setting.

🔒 Safety First
- Photo verification
- Optional background checks
- Date check-in safety features
- Trusted contact notifications
- Block and report tools

💎 Premium Features
- See who liked you
- Unlimited swipes
- Super Likes
- Read receipts
- Advanced filters

Whether you're looking for love, friendship, or something in between, Blossom helps you grow genuine connections.

Download Blossom today and start your journey to finding someone special.
```

#### Keywords (100 characters max):
```
dating,love,relationships,singles,match,romance,meet,chat,flirt,connections,local,verified,safe
```

#### Support URL:
```
https://your-domain.com/support
```

#### Privacy Policy URL:
```
https://your-domain.com/privacy-policy
```

### 4.3 Age Rating
Complete the questionnaire honestly. Dating apps typically receive:
- **17+** rating due to:
  - Unrestricted Web Access
  - Mature/Suggestive Themes

### 4.4 App Privacy
You'll need to declare data collection. For Blossom:

| Data Type | Collected | Purpose |
|-----------|-----------|---------|
| Contact Info (Email) | Yes | App Functionality, Account |
| Location | Yes | App Functionality |
| Photos | Yes | App Functionality |
| User Content | Yes | App Functionality |
| Identifiers | Yes | App Functionality, Analytics |
| Usage Data | Yes | Analytics |

---

## Step 5: Screenshots

### Required Screenshot Sizes:

| Device | Size (pixels) |
|--------|---------------|
| iPhone 6.7" | 1290 x 2796 |
| iPhone 6.5" | 1242 x 2688 |
| iPhone 5.5" | 1242 x 2208 |
| iPad Pro 12.9" | 2048 x 2732 |

### Suggested Screenshots (5-10 per size):
1. **Profile Discovery** - Swiping/browsing profiles
2. **Match Screen** - "It's a Match!" moment
3. **Chat Interface** - Messaging conversation
4. **Profile Setup** - Creating an attractive profile
5. **Map/Nearby** - Location-based discovery
6. **Safety Features** - Verification badges
7. **Premium Features** - Highlight paid features
8. **Events** - Community events screen

### Tips:
- Use real device or Simulator
- Add marketing text overlays (optional)
- Show diverse, inclusive content
- Avoid showing third-party logos

---

## Step 6: Build for Distribution

### 6.1 Update Version Numbers
In Xcode, update:
- **Version**: 1.0.0
- **Build**: 1

### 6.2 Archive the App
1. Select **Any iOS Device** as build target
2. Go to **Product** → **Archive**
3. Wait for archive to complete

### 6.3 Upload to App Store Connect
1. In Organizer, select your archive
2. Click **Distribute App**
3. Choose **App Store Connect**
4. Select **Upload**
5. Follow prompts (keep defaults)
6. Wait for upload to complete

---

## Step 7: Submit for Review

### 7.1 In App Store Connect:
1. Go to your app
2. Click **+ Version or Platform**
3. Enter version **1.0.0**
4. Fill in "What's New" (for updates only)
5. Upload screenshots
6. Select your uploaded build
7. Complete all required fields

### 7.2 App Review Information:
- **Contact**: Your email and phone
- **Demo Account**: Provide test credentials
  ```
  Email: demo@blossom.app
  Password: DemoUser123!
  ```
- **Notes**: Explain any features that need context

### 7.3 Submit
Click **Submit for Review**

---

## Step 8: App Review Timeline

- **Initial Review**: 24-48 hours (typically)
- **If Rejected**: Address issues and resubmit
- **Common Rejection Reasons**:
  - Missing privacy policy
  - Incomplete metadata
  - Bugs or crashes
  - Misleading screenshots
  - Missing login credentials for review

---

## Checklist Before Submission

- [ ] Apple Developer Program active
- [ ] Bundle ID registered
- [ ] App icons (all sizes)
- [ ] Screenshots (all required sizes)
- [ ] App description written
- [ ] Keywords optimized
- [ ] Privacy policy URL live
- [ ] Support URL live
- [ ] Terms of service URL live
- [ ] Age rating questionnaire completed
- [ ] App privacy declarations completed
- [ ] Demo/test account created
- [ ] App tested on real device
- [ ] No debug code or test data
- [ ] Analytics and crash reporting configured
- [ ] Push notification certificates configured

---

## Post-Launch

### Monitor & Respond
- Check App Store Connect for reviews
- Respond to user feedback
- Monitor crash reports in Xcode Organizer

### Update Regularly
- Fix bugs quickly
- Add new features
- Keep dependencies updated

---

## Useful Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)

---

## Quick Commands Reference

```bash
# Build web app
npm run build

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# Run on connected device
npx cap run ios

# Update Capacitor
npx cap update ios
```

---

*Last updated: December 2024*
