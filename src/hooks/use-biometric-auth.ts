import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { NativeBiometric, BiometryType } from "capacitor-native-biometric";

const BIOMETRIC_SERVER = "app.lovable.blossom";

interface BiometricAuthState {
  isAvailable: boolean;
  biometryType: "face" | "fingerprint" | "none";
  hasStoredCredentials: boolean;
}

export const useBiometricAuth = () => {
  const [state, setState] = useState<BiometricAuthState>({
    isAvailable: false,
    biometryType: "none",
    hasStoredCredentials: false,
  });
  const [loading, setLoading] = useState(true);

  const isNative = Capacitor.isNativePlatform();

  const checkAvailability = useCallback(async () => {
    if (!isNative) {
      setLoading(false);
      return;
    }

    try {
      const result = await NativeBiometric.isAvailable();

      let biometryType: "face" | "fingerprint" | "none" = "none";
      if (
        result.biometryType === BiometryType.FACE_ID ||
        result.biometryType === BiometryType.FACE_AUTHENTICATION
      ) {
        biometryType = "face";
      } else if (
        result.biometryType === BiometryType.FINGERPRINT ||
        result.biometryType === BiometryType.TOUCH_ID
      ) {
        biometryType = "fingerprint";
      }

      // Check if we have stored credentials
      let hasStoredCredentials = false;
      try {
        const credentials = await NativeBiometric.getCredentials({
          server: BIOMETRIC_SERVER,
        });
        hasStoredCredentials = !!(
          credentials?.username && credentials?.password
        );
      } catch {
        // No credentials stored
        hasStoredCredentials = false;
      }

      setState({
        isAvailable: result.isAvailable,
        biometryType,
        hasStoredCredentials,
      });
    } catch (error) {
      console.error("Biometric check failed:", error);
    } finally {
      setLoading(false);
    }
  }, [isNative]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  const authenticate = useCallback(async (): Promise<{
    email: string;
    password: string;
  } | null> => {
    if (!isNative || !state.isAvailable) return null;

    try {
      // Verify identity first
      await NativeBiometric.verifyIdentity({
        reason: "Authenticate to access your account",
        title: "Blossom Login",
        subtitle:
          state.biometryType === "face"
            ? "Use Face ID to sign in"
            : "Use fingerprint to sign in",
        description: "Quick and secure access to your matches",
      });

      // Get stored credentials
      const credentials = await NativeBiometric.getCredentials({
        server: BIOMETRIC_SERVER,
      });

      if (credentials?.username && credentials?.password) {
        return {
          email: credentials.username,
          password: credentials.password,
        };
      }

      return null;
    } catch (error) {
      console.error("Biometric authentication failed:", error);
      return null;
    }
  }, [isNative, state.isAvailable, state.biometryType]);

  const saveCredentials = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (!isNative || !state.isAvailable) return false;

      try {
        await NativeBiometric.setCredentials({
          username: email,
          password: password,
          server: BIOMETRIC_SERVER,
        });

        setState((prev) => ({ ...prev, hasStoredCredentials: true }));
        return true;
      } catch (error) {
        console.error("Failed to save credentials:", error);
        return false;
      }
    },
    [isNative, state.isAvailable],
  );

  const deleteCredentials = useCallback(async (): Promise<boolean> => {
    if (!isNative) return false;

    try {
      await NativeBiometric.deleteCredentials({
        server: BIOMETRIC_SERVER,
      });

      setState((prev) => ({ ...prev, hasStoredCredentials: false }));
      return true;
    } catch (error) {
      console.error("Failed to delete credentials:", error);
      return false;
    }
  }, [isNative]);

  const getBiometryLabel = useCallback(() => {
    if (state.biometryType === "face") return "Face ID";
    if (state.biometryType === "fingerprint") return "Fingerprint";
    return "Biometric";
  }, [state.biometryType]);

  return {
    ...state,
    loading,
    isNative,
    authenticate,
    saveCredentials,
    deleteCredentials,
    getBiometryLabel,
    refreshState: checkAvailability,
  };
};
