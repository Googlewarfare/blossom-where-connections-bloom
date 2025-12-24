import { useEffect, useState } from 'react';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

interface AppState {
  isActive: boolean;
  deepLinkUrl: string | null;
}

export const useNativeApp = () => {
  const [appState, setAppState] = useState<AppState>({
    isActive: true,
    deepLinkUrl: null,
  });
  
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative) return;

    // Listen for app state changes
    const stateListener = App.addListener('appStateChange', ({ isActive }) => {
      setAppState(prev => ({ ...prev, isActive }));
    });

    // Listen for deep links
    const urlListener = App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      setAppState(prev => ({ ...prev, deepLinkUrl: event.url }));
    });

    // Listen for back button (Android)
    const backListener = App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    return () => {
      stateListener.then(l => l.remove());
      urlListener.then(l => l.remove());
      backListener.then(l => l.remove());
    };
  }, [isNative]);

  const setStatusBarStyle = async (style: 'dark' | 'light') => {
    if (!isNative) return;
    await StatusBar.setStyle({ style: style === 'dark' ? Style.Dark : Style.Light });
  };

  const hideStatusBar = async () => {
    if (!isNative) return;
    await StatusBar.hide();
  };

  const showStatusBar = async () => {
    if (!isNative) return;
    await StatusBar.show();
  };

  const setStatusBarBackgroundColor = async (color: string) => {
    if (!isNative) return;
    await StatusBar.setBackgroundColor({ color });
  };

  const getAppInfo = async () => {
    if (!isNative) return null;
    return await App.getInfo();
  };

  const exitApp = () => {
    if (!isNative) return;
    App.exitApp();
  };

  return {
    ...appState,
    isNative,
    setStatusBarStyle,
    hideStatusBar,
    showStatusBar,
    setStatusBarBackgroundColor,
    getAppInfo,
    exitApp,
  };
};
