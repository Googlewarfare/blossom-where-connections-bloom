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
  const cap = window.Capacitor as any;
  if (cap && typeof cap.triggerEvent !== "function") {
    cap.triggerEvent = (eventName: string, _target: string, data?: any) => {
      const evt = new CustomEvent(eventName, { detail: data });
      window.dispatchEvent(evt);
      document.dispatchEvent(evt);
    };
  }
};

ensureCapacitorTriggerEvent();

// Hide native splash as soon as our JS boots.
if (Capacitor.isNativePlatform()) {
  SplashScreen.hide().catch(() => {
    // no-op
  });
}

createRoot(document.getElementById("root")!).render(<App />);
