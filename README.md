# Blossom — Where Connections Bloom 🌸

Blossom is a modern dating app built for meaningful connections with a strong emphasis on **verification, safety tools, and real conversation** — delivered through a **fast React web app** with **native iOS/Android capabilities** via Capacitor.

> TL;DR: React + TypeScript + Vite + Tailwind/shadcn + Supabase + Capacitor.

---

## Table of Contents

- [What is Blossom?](#what-is-blossom)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Screens & Domains](#screens--domains)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Run Locally](#run-locally)
- [Build & Deployment](#build--deployment)
- [Capacitor Native Builds](#capacitor-native-builds)
- [Code Quality](#code-quality)
- [Project Structure](#project-structure)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## What is Blossom?

Blossom is a dating app focused on:

- **Verified profiles** (photo verification + optional background checks)
- **Safety-first dating** (trusted contacts, date check-ins, reporting)
- **Genuine conversation** (icebreakers, daily questions, reactions, voice notes)
- **Native feel** (push notifications, haptics, biometrics, camera)

---

## Core Features

- **Discovery & Matching**
  - Swipe/discover flow
  - Compatibility scoring
  - Advanced filters (premium)

- **Messaging**
  - Real-time chat
  - Reactions, media sharing, voice notes

- **Video Calls**
  - In-app calling with matches

- **Profile & Verification**
  - Profile completeness guidance
  - Verification badges
  - Optional background check request flow

- **Safety Tools**
  - Date check-ins
  - Trusted contacts / reporting
  - Security dashboard & privacy settings

- **Premium**
  - Read receipts, advanced filters, upgrades (native purchases)

- **Events & Stories**
  - Local events discovery
  - Story feed (24h)

---

## Tech Stack

**Frontend**

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui (Radix primitives)
- React Router
- TanStack Query (React Query)
- Framer Motion

**Backend**

- Supabase (Auth, Postgres, Storage, Edge Functions)

**Mobile**

- Capacitor (iOS & Android)
- Push notifications, camera, biometrics, haptics
- In-app purchases (StoreKit / cordova-plugin-purchase)

**Other**

- Mapbox GL (maps + geocoding)
- Vite PWA plugin

---

## Screens & Domains

Key domains in the app:

- **Auth**: login/register, session management, 2FA
- **Onboarding**: profile setup, permissions (camera/notifications/biometric)
- **Discovery**: browse + filter + match
- **Chat**: messages, media, voice, actions/reactions
- **Profile**: edit profile, completion prompts, verification state
- **Safety & Privacy**: reporting, guidelines, privacy settings, security dashboard
- **Premium**: upgrades, entitlement gating
- **Admin**: verification queue, reports, audit logs (if enabled)

---

## Getting Started

### Prerequisites

- Node.js **18+**
- npm (recommended for Capacitor compatibility)
- (Optional) Supabase CLI if you plan to run migrations/functions locally

### Install

```bash
npm install
```

---

## Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_MAPBOX_PUBLIC_TOKEN=your_mapbox_token
```

---

## Supabase Setup

This project uses Supabase for authentication, database, storage, and edge functions. Migrations are located in `supabase/migrations/`.

---

## Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Build & Deployment

### Web

```bash
npm run build
```

Deploy via Lovable: Open project → Share → Publish

### Production Build

```bash
npm run build
npm run preview
```

---

## Capacitor Native Builds

### iOS

```bash
npx cap add ios          # First time only
npm run build
npx cap sync ios
npx cap open ios         # Opens Xcode
```

**Requirements:**
- macOS with Xcode 15+
- Apple Developer account (for device testing)
- Configured signing certificates and provisioning profiles

### Android

```bash
npx cap add android      # First time only
npm run build
npx cap sync android
npx cap open android     # Opens Android Studio
```

### Native Capabilities

- Push Notifications (APNs / FCM)
- In-App Purchases (StoreKit / Google Play Billing)
- Biometric Authentication (Face ID / Touch ID / Fingerprint)
- Camera access for photo uploads
- Haptic feedback

---

## Code Quality

```bash
npm run lint             # ESLint
npm run format           # Prettier
```

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/              # shadcn/ui primitives
├── pages/               # Route pages
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
└── integrations/        # Supabase client and types

supabase/
├── functions/           # Edge functions
└── migrations/          # Database migrations

ios/                     # Native iOS project
android/                 # Native Android project
```

---

## Security Notes

- RLS policies protect all user data
- Photo verification with admin review
- Optional background checks
- Rate limiting on sensitive endpoints
- Audit logging for admin actions

---

## Troubleshooting

### iOS Simulator Warnings

Haptic pattern errors and keyboard constraint warnings are normal iOS Simulator behavior and won't appear on real devices.

### Build Errors

If `npm run build` fails with missing dependencies:

```bash
npm install
npm run build
```

### Capacitor Sync

After pulling changes that affect native code:

```bash
npx cap sync
```

---

## License

Private - All rights reserved
