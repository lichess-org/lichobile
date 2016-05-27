declare type LichessOptions = {
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
  lichess: LichessOptions;
  moment: any;
  analytics: Analytics;
  shouldRotateToOrientation: () => boolean;
}

declare type LichessMessage = {
  t: string;
  d?: string;
}

declare type WorkerMessage = {
  topic: string;
  payload?: any;
}

declare type User = {
  id: string;
  username: string;
  name?: string;
  language: string;
  title?: string;
  rating?: number;
  online?: boolean;
}

declare type Player = {
  id: string;
  rating?: number;
  color: 'white' | 'black';
  user?: User;
  provisional?: boolean;
  username?: string;
  ai?: number;
  onGame?: boolean;
}

declare type TournamentClock = {
  limit: number;
  increment: number;
}

declare type ChallengeClock = {
  timeControl: TimeControl;
}

declare type TimeControl = {
  type: string;
  show?: string;
  daysPerTurn?: number;
}

declare type GameData = {
  game: Game;
  player: Player;
  opponent: Player;
}

declare type Game = {
  variant: Variant;
  player: 'black' | 'white';
}

declare type Variant = {
  key: string;
  name: string;
  short: string;
  title: string;
}

declare type Dimensions = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}


