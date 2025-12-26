import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

export const useHaptics = () => {
  const isNative = Capacitor.isNativePlatform();

  const impact = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (!isNative) return;
    await Haptics.impact({ style });
  };

  const notification = async (
    type: NotificationType = NotificationType.Success,
  ) => {
    if (!isNative) return;
    await Haptics.notification({ type });
  };

  const vibrate = async (duration: number = 300) => {
    if (!isNative) return;
    await Haptics.vibrate({ duration });
  };

  const selectionStart = async () => {
    if (!isNative) return;
    await Haptics.selectionStart();
  };

  const selectionChanged = async () => {
    if (!isNative) return;
    await Haptics.selectionChanged();
  };

  const selectionEnd = async () => {
    if (!isNative) return;
    await Haptics.selectionEnd();
  };

  return {
    isNative,
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd,
    ImpactStyle,
    NotificationType,
  };
};
