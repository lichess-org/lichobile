declare type lichess = {
  apiEndPoint: string;
  socketEndPoint: string;
  mode: string;
  version: string;
  gaId: string;
  gcmSenderId: string;
}

declare type Analytics = {
  debugMode(success: () => void, error: (e: string) => void): void;
  startTrackerWithId(id: string, success: () => void, error: (e: string) => void): void;
  trackView(screen: string, success: () => void, error: (e: string) => void): void;
  trackException(description: string, fatal: boolean, success: () => void, error: (e: string) => void): void;
  trackEvent(category: string, action: string, label: string, value: number, success: () => void, error: (e: string) => void): void;
  trackTiming(category: string, interval: number, name: string, label: string, success: () => void, error: (e: string) => void): void;
}

interface Window {
  lichess: lichess;
  moment: any;
  analytics: Analytics;
  shouldRotateToOrientation: () => boolean;
}
