/**
 * Features Module Barrel Export
 * 
 * Central export for all feature modules.
 * Each feature is self-contained and exports its public API.
 * 
 * Import Rules:
 * - features/ can import from shared/, services/, app/
 * - features/ should NOT import from other features/ (use shared/ instead)
 * - shared/ should NOT import from features/
 * - services/ should NOT import UI components
 */

// Re-export all features
export * as auth from "./auth";
export * as onboarding from "./onboarding";
export * as profile from "./profile";
export * as discovery from "./discovery";
export * as chat from "./chat";
export * as video from "./video";
export * as safety from "./safety";
export * as premium from "./premium";
export * as events from "./events";
export * as admin from "./admin";
