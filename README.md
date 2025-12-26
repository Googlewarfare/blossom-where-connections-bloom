# Blossom - Modern Dating App

A thoughtfully designed dating application built with modern web technologies and native mobile capabilities.

## What is Blossom?

Blossom is a dating app focused on meaningful connections through verified profiles, safety features, and genuine conversations. It emphasizes user safety with background checks, trusted contacts, and date check-ins while providing a polished, native mobile experience.

## Core Features

- **Profile Discovery** - Swipe-based matching with compatibility scores
- **Verified Profiles** - Photo verification and optional background checks
- **Real-time Chat** - Messaging with reactions, media sharing, and voice notes
- **Video Calls** - In-app video calling with matches
- **Events** - Discover and attend local dating events
- **Stories** - Share moments with 24-hour stories
- **Safety Tools** - Date check-ins, trusted contacts, and reporting
- **Premium Features** - Super likes, read receipts, advanced filters

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State**: TanStack Query (React Query)
- **Backend**: Supabase (Auth, Database, Edge Functions, Storage)
- **Mobile**: Capacitor (iOS & Android)
- **Maps**: Mapbox GL
- **Animations**: Framer Motion

## Local Development

### Prerequisites

- Node.js 18+
- npm (recommended for Capacitor compatibility)

### Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_MAPBOX_PUBLIC_TOKEN=your_mapbox_token
```

## iOS Build (Capacitor)

```bash
# Add iOS platform (first time only)
npx cap add ios

# Sync web assets to native
npm run build
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### iOS Requirements

- macOS with Xcode 15+
- Apple Developer account (for device testing)
- Configured signing certificates and provisioning profiles

### Native Capabilities

The iOS build includes:
- Push Notifications (APNs)
- In-App Purchases (StoreKit)
- Biometric Authentication (Face ID / Touch ID)
- Camera access for photo uploads
- Haptic feedback

## Android Build

```bash
# Add Android platform (first time only)
npx cap add android

# Sync and run
npm run build
npx cap sync android
npx cap open android
```

## Project Structure

```
src/
├── components/     # Reusable UI components
│   └── ui/         # shadcn/ui primitives
├── pages/          # Route pages
├── hooks/          # Custom React hooks
├── lib/            # Utilities and helpers
└── integrations/   # Supabase client and types

supabase/
├── functions/      # Edge functions
└── migrations/     # Database migrations

ios/                # Native iOS project
android/            # Native Android project
```

## Deployment

### Web

Deploy via Lovable: Open project → Share → Publish

### Mobile

1. Build for production: `npm run build`
2. Sync native projects: `npx cap sync`
3. Archive and submit via Xcode (iOS) or Android Studio

## License

Private - All rights reserved
