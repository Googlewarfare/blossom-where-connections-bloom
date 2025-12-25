import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App, URLOpenListenerEvent } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export const useDeepLinks = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleDeepLink = (event: URLOpenListenerEvent) => {
      const url = new URL(event.url);
      const path = url.pathname;
      const params = url.searchParams;

      // Handle password reset
      if (path.includes("/auth/reset") || params.has("type") && params.get("type") === "recovery") {
        navigate("/auth?mode=reset");
        return;
      }

      // Handle email verification
      if (path.includes("/auth/verify") || params.has("type") && params.get("type") === "signup") {
        navigate("/auth?verified=true");
        return;
      }

      // Handle invite links
      if (path.includes("/invite")) {
        const inviteCode = params.get("code");
        if (inviteCode) {
          navigate(`/auth?invite=${inviteCode}`);
        }
        return;
      }

      // Handle profile deep links
      if (path.includes("/profile/")) {
        const profileId = path.split("/profile/")[1];
        if (profileId) {
          navigate(`/discover?profile=${profileId}`);
        }
        return;
      }

      // Handle match/chat deep links
      if (path.includes("/chat/")) {
        const matchId = path.split("/chat/")[1];
        if (matchId) {
          navigate(`/chat/${matchId}`);
        }
        return;
      }

      // Default: navigate to the path
      if (path && path !== "/") {
        navigate(path);
      }
    };

    const listener = App.addListener("appUrlOpen", handleDeepLink);

    return () => {
      listener.then((l) => l.remove());
    };
  }, [navigate]);
};
