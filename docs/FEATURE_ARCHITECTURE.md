# Feature Architecture

This document explains the feature-based architecture used in Blossom.

## Folder Structure

```
src/
├── app/                    # Application setup
│   ├── config/             # Environment validation, constants
│   ├── providers/          # React context providers (Query, etc.)
│   └── router/             # Route guards, route config
│
├── shared/                 # Reusable across features
│   ├── components/         # UI components (shadcn/ui + custom)
│   ├── hooks/              # Generic React hooks
│   ├── lib/                # Utility functions
│   └── types/              # Common TypeScript types
│
├── services/               # External integrations
│   ├── supabase/           # Database, auth, storage
│   ├── analytics/          # Page/event tracking
│   └── mapbox/             # Maps integration
│
├── features/               # Domain-specific modules
│   ├── auth/               # Login, signup, MFA, biometrics
│   ├── onboarding/         # Profile setup, permissions
│   ├── profile/            # Profile view/edit, verification
│   ├── discovery/          # Browsing, matching, filters
│   ├── chat/               # Messaging, media, reactions
│   ├── video/              # Video calling
│   ├── safety/             # Check-ins, reporting, privacy
│   ├── premium/            # Subscriptions, purchases
│   ├── events/             # Events, stories
│   └── admin/              # Admin dashboard, moderation
│
├── pages/                  # Route entry points (legacy)
├── components/             # Components (legacy, being migrated)
├── hooks/                  # Hooks (legacy, being migrated)
└── lib/                    # Utilities (legacy, being migrated)
```

## Import Rules

1. **features/** can import from: `shared/`, `services/`, `app/`
2. **features/** should NOT import from other features (use shared instead)
3. **shared/** should NOT import from `features/`
4. **services/** should NOT import UI components

## Route Guards

Located in `src/app/router/`:

- `RequireAuth` - Redirects unauthenticated users to `/auth`
- `RequireOnboarding` - Redirects incomplete profiles to `/onboarding`
- `RequireAdmin` - Restricts access to admin/moderator roles

## Environment Validation

`src/app/config/env.ts` validates required environment variables at startup:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_MAPBOX_PUBLIC_TOKEN`

## Migration Strategy

Components remain in their original locations with barrel exports in feature modules. This allows gradual migration without breaking existing imports.
