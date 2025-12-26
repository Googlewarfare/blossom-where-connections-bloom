import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { useCallback } from 'react';

export const useHaptics = () => {
  const isNative = Capacitor.isNativePlatform();

  const impact = useCallback(async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style });
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [isNative]);

  const notification = useCallback(async (type: NotificationType = NotificationType.Success) => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type });
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [isNative]);

  const vibrate = useCallback(async (duration: number = 300) => {
    if (!isNative) return;
    try {
      await Haptics.vibrate({ duration });
    } catch {
      // Silently fail if haptics unavailable
    }
  }, [isNative]);

  const selectionStart = useCallback(async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionStart();
    } catch {
      // Silently fail
    }
  }, [isNative]);

  const selectionChanged = useCallback(async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionChanged();
    } catch {
      // Silently fail
    }
  }, [isNative]);

  const selectionEnd = useCallback(async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionEnd();
    } catch {
      // Silently fail
    }
  }, [isNative]);

  // Convenience presets for common interactions
  const lightTap = useCallback(() => impact(ImpactStyle.Light), [impact]);
  const mediumTap = useCallback(() => impact(ImpactStyle.Medium), [impact]);
  const heavyTap = useCallback(() => impact(ImpactStyle.Heavy), [impact]);
  
  const success = useCallback(() => notification(NotificationType.Success), [notification]);
  const warning = useCallback(() => notification(NotificationType.Warning), [notification]);
  const error = useCallback(() => notification(NotificationType.Error), [notification]);

  // Semantic haptics for specific actions
  const buttonPress = useCallback(() => impact(ImpactStyle.Light), [impact]);
  const toggleSwitch = useCallback(() => impact(ImpactStyle.Medium), [impact]);
  const cardSwipe = useCallback(() => impact(ImpactStyle.Medium), [impact]);
  const likeAction = useCallback(() => notification(NotificationType.Success), [notification]);
  const matchFound = useCallback(async () => {
    // Double haptic for exciting match notification
    await notification(NotificationType.Success);
    setTimeout(() => notification(NotificationType.Success), 150);
  }, [notification]);
  const messageReceived = useCallback(() => impact(ImpactStyle.Light), [impact]);
  const pullToRefresh = useCallback(() => impact(ImpactStyle.Medium), [impact]);

  return {
    isNative,
    // Raw functions
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd,
    // Intensity presets
    lightTap,
    mediumTap,
    heavyTap,
    // Notification presets
    success,
    warning,
    error,
    // Semantic actions
    buttonPress,
    toggleSwitch,
    cardSwipe,
    likeAction,
    matchFound,
    messageReceived,
    pullToRefresh,
    // Enums for custom usage
    ImpactStyle,
    NotificationType,
  };
};

// Static haptic functions for use outside React components
export const haptics = {
  impact: async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.impact({ style });
    } catch {
      // Silently fail
    }
  },
  notification: async (type: NotificationType = NotificationType.Success) => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await Haptics.notification({ type });
    } catch {
      // Silently fail
    }
  },
  light: () => haptics.impact(ImpactStyle.Light),
  medium: () => haptics.impact(ImpactStyle.Medium),
  heavy: () => haptics.impact(ImpactStyle.Heavy),
  success: () => haptics.notification(NotificationType.Success),
  warning: () => haptics.notification(NotificationType.Warning),
  error: () => haptics.notification(NotificationType.Error),
};
