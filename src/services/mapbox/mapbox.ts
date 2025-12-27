/**
 * Mapbox Service
 * 
 * Helper functions for Mapbox GL integration.
 * Handles token management and common map operations.
 */

import { env } from "@/app/config/env";

/**
 * Get the Mapbox public access token.
 */
export function getMapboxToken(): string {
  return env.MAPBOX_PUBLIC_TOKEN;
}

/**
 * Check if Mapbox is properly configured.
 */
export function isMapboxConfigured(): boolean {
  const token = getMapboxToken();
  return Boolean(token && token.trim().length > 0);
}

/**
 * Default map style URLs
 */
export const MAP_STYLES = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
  streets: "mapbox://styles/mapbox/streets-v12",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
} as const;

/**
 * Default map configuration
 */
export const DEFAULT_MAP_CONFIG = {
  zoom: 12,
  pitch: 0,
  bearing: 0,
  center: [-74.006, 40.7128] as [number, number], // NYC default
} as const;

export const mapbox = {
  getToken: getMapboxToken,
  isConfigured: isMapboxConfigured,
  styles: MAP_STYLES,
  defaultConfig: DEFAULT_MAP_CONFIG,
};
