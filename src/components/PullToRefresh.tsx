import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { haptics } from '@/hooks/use-haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className = '',
  threshold = 80,
  disabled = false,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  
  // Transform for the refresh indicator
  const indicatorOpacity = useTransform(y, [0, threshold / 2, threshold], [0, 0.5, 1]);
  const indicatorScale = useTransform(y, [0, threshold], [0.5, 1]);
  const indicatorRotation = useTransform(y, [0, threshold * 2], [0, 360]);
  
  const handleDragStart = useCallback(() => {
    if (disabled || refreshing) return;
    setTriggered(false);
  }, [disabled, refreshing]);

  const handleDrag = useCallback(
    (_: any, info: PanInfo) => {
      if (disabled || refreshing) return;
      
      // Only allow pull down when at top of scroll
      const container = containerRef.current;
      if (container && container.scrollTop > 0) {
        y.set(0);
        return;
      }
      
      // Resistance effect - the further you pull, the harder it gets
      const resistance = 0.5;
      const pullDistance = Math.max(0, info.offset.y * resistance);
      y.set(pullDistance);
      
      // Trigger haptic when crossing threshold
      if (pullDistance >= threshold && !triggered) {
        setTriggered(true);
        haptics.medium();
      } else if (pullDistance < threshold && triggered) {
        setTriggered(false);
      }
    },
    [disabled, refreshing, threshold, triggered, y]
  );

  const handleDragEnd = useCallback(async () => {
    if (disabled || refreshing) return;
    
    const currentY = y.get();
    
    if (currentY >= threshold) {
      // Trigger refresh
      setRefreshing(true);
      haptics.success();
      
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    
    // Animate back to top
    y.set(0);
    setTriggered(false);
  }, [disabled, refreshing, threshold, onRefresh, y]);

  return (
    <div className={`relative overflow-hidden ${className}`} ref={containerRef}>
      {/* Refresh Indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center"
        style={{
          y: useTransform(y, (value) => Math.min(value - 40, threshold - 40)),
          opacity: indicatorOpacity,
          scale: indicatorScale,
        }}
      >
        <motion.div
          className={`p-3 rounded-full shadow-lg ${
            triggered || refreshing
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground'
          }`}
          style={{
            rotate: refreshing ? undefined : indicatorRotation,
          }}
          animate={refreshing ? { rotate: 360 } : undefined}
          transition={refreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : undefined}
        >
          <RefreshCw className="h-5 w-5" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y }}
        drag={disabled || refreshing ? false : 'y'}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};
