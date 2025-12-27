/**
 * Image utilities for cross-platform compatibility
 * Provides fallback support for image formats that may not work on all platforms
 */

/**
 * Check if the browser supports WebP format
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src =
      'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
};

/**
 * Get the best image format for the current platform
 * Returns 'webp' if supported, otherwise 'jpg'
 */
let cachedWebPSupport: boolean | null = null;

export const getBestImageFormat = async (): Promise<'webp' | 'jpg'> => {
  if (cachedWebPSupport === null) {
    cachedWebPSupport = await supportsWebP();
  }
  return cachedWebPSupport ? 'webp' : 'jpg';
};

/**
 * Get image URL with format fallback
 * If the URL ends with .webp and WebP is not supported, attempts to use .jpg fallback
 */
export const getImageWithFallback = (
  originalUrl: string,
  fallbackUrl?: string
): string => {
  // If a specific fallback is provided, use it
  if (fallbackUrl) {
    return fallbackUrl;
  }

  // For WebP images, try to provide a fallback URL
  if (originalUrl.toLowerCase().endsWith('.webp')) {
    // Replace .webp with .jpg for fallback
    return originalUrl.replace(/\.webp$/i, '.jpg');
  }

  return originalUrl;
};

/**
 * React hook-friendly image source getter
 * Returns an object with src and fallback for use in img tags
 */
export const getImageSources = (
  primaryUrl: string,
  fallbackUrl?: string
): { src: string; fallback: string } => {
  const fallback = fallbackUrl || getImageWithFallback(primaryUrl);
  return {
    src: primaryUrl,
    fallback,
  };
};

/**
 * Handle image load error by switching to fallback
 * Use as onError handler: onError={(e) => handleImageError(e, fallbackUrl)}
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement>,
  fallbackUrl: string
): void => {
  const img = event.currentTarget;
  
  // Prevent infinite loop if fallback also fails
  if (img.src === fallbackUrl) {
    return;
  }
  
  img.src = fallbackUrl;
};

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

/**
 * Check if running in Capacitor native app
 */
export const isCapacitorNative = (): boolean => {
  return typeof (window as any).Capacitor !== 'undefined' && 
         (window as any).Capacitor.isNativePlatform();
};

/**
 * Get optimized image URL for the current platform
 * On iOS native, prefer JPEG over WebP for better compatibility
 */
export const getPlatformOptimizedUrl = (
  webpUrl: string,
  jpegUrl?: string
): string => {
  // On iOS native app, prefer JPEG for better WKWebView compatibility
  if (isIOS() && isCapacitorNative() && webpUrl.toLowerCase().endsWith('.webp')) {
    return jpegUrl || webpUrl.replace(/\.webp$/i, '.jpg');
  }
  
  return webpUrl;
};
