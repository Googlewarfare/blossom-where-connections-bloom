import React from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import App from "./App.tsx";
import "./index.css";

declare global {
  interface Window {
    Capacitor?: {
      triggerEvent?: (...args: any[]) => void;
      [key: string]: any;
    };
  }
}

// Defensive shim: prevents blank-screen crashes if the native bridge doesn't
// inject `triggerEvent` (seen on some iOS WebView starts).
const ensureCapacitorTriggerEvent = () => {
  const win = window as any;
  if (!win.Capacitor) win.Capacitor = {};
  const cap = win.Capacitor;

  if (typeof cap.triggerEvent !== "function") {
    cap.triggerEvent = (eventName: string, _target: string, data?: any) => {
      const evt = new CustomEvent(eventName, { detail: data });
      window.dispatchEvent(evt);
      document.dispatchEvent(evt);
    };
  }
};

ensureCapacitorTriggerEvent();

// Hide native splash after a short delay to ensure app is rendered
if (Capacitor.isNativePlatform()) {
  // Small delay ensures React has mounted before hiding splash
  setTimeout(() => {
    SplashScreen.hide().catch(() => {
      // no-op
    });
  }, 100);
}

createRoot(document.getElementById("root")!).render(<App />);
