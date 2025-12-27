import React, { useState, useCallback } from 'react';
import { getPlatformOptimizedUrl, handleImageError } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}

/**
 * OptimizedImage component with automatic format fallback
 * Handles WebP to JPEG fallback for iOS compatibility
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  fallbackSrc,
  alt,
  className,
  onError,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(() => 
    getPlatformOptimizedUrl(src, fallbackSrc)
  );
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setHasError(true);
      } else if (!hasError) {
        // Try automatic WebP to JPEG conversion
        const jpegFallback = src.replace(/\.webp$/i, '.jpg');
        if (currentSrc !== jpegFallback && src.toLowerCase().endsWith('.webp')) {
          setCurrentSrc(jpegFallback);
          setHasError(true);
        }
      }
      
      // Call original onError if provided
      onError?.(event);
    },
    [hasError, fallbackSrc, currentSrc, src, onError]
  );

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn(className)}
      onError={handleError}
      {...props}
    />
  );
};

export default OptimizedImage;
