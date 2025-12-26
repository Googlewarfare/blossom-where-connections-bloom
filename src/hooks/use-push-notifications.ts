import { useEffect, useState, useCallback } from "react";
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

interface PushNotificationState {
  token: string | null;
  notifications: PushNotificationSchema[];
  isRegistered: boolean;
  error: string | null;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    token: null,
    notifications: [],
    isRegistered: false,
    error: null,
  });

  const isNative = Capacitor.isNativePlatform();

  // Save token to user metadata (could also be a separate table)
  const saveTokenToBackend = useCallback(async (token: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Store in user metadata
        await supabase.auth.updateUser({
          data: {
            push_token: token,
            push_token_updated_at: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error("Failed to save push token:", error);
    }
  }, []);

  const register = useCallback(async () => {
    if (!isNative) {
      setState((prev) => ({
        ...prev,
        error: "Push notifications only available on native platforms",
      }));
      return;
    }

    try {
      // Request permission
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === "prompt") {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== "granted") {
        setState((prev) => ({
          ...prev,
          error: "Push notification permission not granted",
        }));
        return;
      }

      // Register with Apple/Google
      await PushNotifications.register();
      setState((prev) => ({ ...prev, isRegistered: true, error: null }));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to register for push notifications";
      setState((prev) => ({ ...prev, error: message }));
    }
  }, [isNative]);

  useEffect(() => {
    if (!isNative) return;

    // Registration success
    const tokenListener = PushNotifications.addListener(
      "registration",
      async (token: Token) => {
        setState((prev) => ({
          ...prev,
          token: token.value,
          isRegistered: true,
        }));
        console.log("Push registration success, token:", token.value);

        // Save token to backend
        await saveTokenToBackend(token.value);
      },
    );

    // Registration error
    const errorListener = PushNotifications.addListener(
      "registrationError",
      (error) => {
        setState((prev) => ({
          ...prev,
          error: error.error,
          isRegistered: false,
        }));
        console.error("Push registration error:", error.error);
      },
    );

    // Notification received while app is in foreground
    const receivedListener = PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema) => {
        setState((prev) => ({
          ...prev,
          notifications: [...prev.notifications, notification],
        }));
        console.log("Push notification received:", notification);
      },
    );

    // Notification action performed (user tapped on notification)
    const actionListener = PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action: ActionPerformed) => {
        console.log("Push notification action performed:", action);
      },
    );

    return () => {
      tokenListener.then((l) => l.remove());
      errorListener.then((l) => l.remove());
      receivedListener.then((l) => l.remove());
      actionListener.then((l) => l.remove());
    };
  }, [isNative]);

  const clearNotifications = () => {
    setState((prev) => ({ ...prev, notifications: [] }));
  };

  const getDeliveredNotifications = async () => {
    if (!isNative) return [];
    const result = await PushNotifications.getDeliveredNotifications();
    return result.notifications;
  };

  const removeAllDeliveredNotifications = async () => {
    if (!isNative) return;
    await PushNotifications.removeAllDeliveredNotifications();
  };

  return {
    ...state,
    isNative,
    register,
    clearNotifications,
    getDeliveredNotifications,
    removeAllDeliveredNotifications,
  };
};
