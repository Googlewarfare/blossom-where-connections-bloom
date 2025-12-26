/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get user's current location using browser geolocation API
 * @returns Promise with latitude and longitude
 */
export function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
    );
  });
}

/**
 * Convert centimeters to feet and inches
 * @param cm Height in centimeters
 * @returns Object with feet and inches
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

/**
 * Convert feet and inches to centimeters
 * @param feet Number of feet
 * @param inches Number of inches
 * @returns Height in centimeters
 */
export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

/**
 * Format height in feet and inches as a string
 * @param cm Height in centimeters
 * @returns Formatted string like "5'10\""
 */
export function formatHeightFtIn(cm: number): string {
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}'${inches}"`;
}

/**
 * Fuzz GPS coordinates to protect user privacy
 * Adds random offset within a specified radius (default ~0.5 miles)
 * @param latitude Original latitude
 * @param longitude Original longitude
 * @param radiusMiles Fuzzing radius in miles (default 0.5)
 * @returns Fuzzed coordinates
 */
export function fuzzLocation(
  latitude: number,
  longitude: number,
  radiusMiles: number = 0.5
): { latitude: number; longitude: number } {
  // Convert radius from miles to degrees (approximate)
  // 1 degree latitude ≈ 69 miles
  const latOffset = radiusMiles / 69;
  // Longitude degrees vary by latitude
  const lngOffset = radiusMiles / (69 * Math.cos(latitude * (Math.PI / 180)));

  // Generate random offset within the radius
  const randomAngle = Math.random() * 2 * Math.PI;
  const randomRadius = Math.random();

  const fuzzedLat = latitude + latOffset * randomRadius * Math.cos(randomAngle);
  const fuzzedLng = longitude + lngOffset * randomRadius * Math.sin(randomAngle);

  return {
    latitude: fuzzedLat,
    longitude: fuzzedLng,
  };
}

/**
 * Round coordinates to a grid for consistent approximate areas
 * This ensures the same user always appears in the same approximate area
 * @param latitude Original latitude
 * @param longitude Original longitude
 * @param gridSizeMiles Size of grid cells in miles (default 0.5)
 * @returns Snapped coordinates to grid center
 */
export function snapToGrid(
  latitude: number,
  longitude: number,
  gridSizeMiles: number = 0.5
): { latitude: number; longitude: number } {
  // Convert grid size from miles to degrees
  const latGridSize = gridSizeMiles / 69;
  const lngGridSize = gridSizeMiles / (69 * Math.cos(latitude * (Math.PI / 180)));

  // Snap to grid center
  const snappedLat = Math.floor(latitude / latGridSize) * latGridSize + latGridSize / 2;
  const snappedLng = Math.floor(longitude / lngGridSize) * lngGridSize + lngGridSize / 2;

  return {
    latitude: snappedLat,
    longitude: snappedLng,
  };
}

/**
 * Apply deterministic fuzzing based on user ID for consistent display
 * Same user always appears in approximately the same fuzzed location
 * @param latitude Original latitude
 * @param longitude Original longitude
 * @param userId User ID for deterministic offset
 * @param radiusMiles Fuzzing radius in miles (default 0.5)
 * @returns Fuzzed coordinates
 */
export function fuzzLocationDeterministic(
  latitude: number,
  longitude: number,
  userId: string,
  radiusMiles: number = 0.5
): { latitude: number; longitude: number } {
  // Create a deterministic hash from user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Normalize hash to 0-1 range
  const normalized = Math.abs(hash) / 2147483647;
  const angle = normalized * 2 * Math.PI;
  const radius = (normalized * 0.7 + 0.3); // 30-100% of max radius

  // Convert radius from miles to degrees
  const latOffset = radiusMiles / 69;
  const lngOffset = radiusMiles / (69 * Math.cos(latitude * (Math.PI / 180)));

  const fuzzedLat = latitude + latOffset * radius * Math.cos(angle);
  const fuzzedLng = longitude + lngOffset * radius * Math.sin(angle);

  return {
    latitude: fuzzedLat,
    longitude: fuzzedLng,
  };
}
