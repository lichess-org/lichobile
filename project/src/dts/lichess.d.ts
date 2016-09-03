declare type Timestamp = number;

declare type StringMap = {
  [i: string]: string;
}

interface Prop<T> {
  (): T
  (value: T): T;
}

interface LichessOptions {
  apiEndPoint: string;
  socketEndPoint: string;
  mode: string;
  version: string;
  gaId: string;
  gcmSenderId: string;
}

interface Analytics {
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

interface PongMessage {
  d: number;
  r: number;
}

interface LichessMessage {
  t: string;
  d?: string;
}

interface WorkerMessage {
  topic: string;
  payload?: any;
}

interface PlayTime {
  total: number;
  tv: number;
}

interface User {
  booster: boolean;
  engine: boolean;
  patron: boolean;
  id: string;
  username: string;
  name?: string;
  language: string;
  title?: string;
  rating?: number;
  online?: boolean;
  createdAt: Timestamp;
  seenAt: Timestamp;
  perfs: any;
  playTime?: PlayTime;
}

declare type Role = 'king' | 'queen' | 'knight' | 'bishop' | 'rook' | 'pawn';

declare type Pos = 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1' | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8';

declare type DestsMap = {
  [index: string]: Array<Pos>
}

interface Piece {
  role: Role;
  color: Color;
}

interface Drop {
  role: Role;
  key: Pos;
}

declare type Color = 'white' | 'black';

interface Player {
  id: string;
  rating?: number;
  color: Color;
  user?: User;
  provisional?: boolean;
  username?: string;
  ai?: number;
  onGame?: boolean;
  isGone?: boolean;
  engineName?: string;
  offeringDraw?: boolean;
  proposingTakeback?: boolean;
  offeringRematch?: boolean;
  spectator?: boolean;
  berserk?: boolean;
  version?: number;
  checks?: number;
}

interface TournamentClock {
  limit: number;
  increment: number;
}

interface ClockData {
  black: number;
  white: number;
  emerg: number;
  running: boolean;
  initial: number;
  increment: number;
}

interface CorrespondenceClockData {
  barTime: number;
  black: number;
  daysPerTurn: number;
  emerg: number;
  increment: number;
  white: number;
}

interface Tournament {
  id: string;
  berserkable: boolean;
  secondsToFinish: number;
  nbSecondsForFirstMove: number;
  ranks?: {
    white: string;
    black: string;
    [color: string]: string;
  }
}

interface GameData {
  game: OnlineGame;
  player: Player;
  opponent: Player;
  correspondence?: CorrespondenceClockData;
  clock?: ClockData;
  steps?: Array<GameStep>;
  tournament?: Tournament;
  takebackable: boolean;
  note?: string;
  chat?: Array<string>;
  possibleMoves?: StringMap;
  possibleDrops?: string | Array<string>;
  userTV?: string;
  tv?: string;
  pref?: any;
  url?: {
    round: string;
    socket: string;
  }
  bookmarked?: boolean;
}

interface OfflineGameData {
  game: OfflineGame;
  player: OfflinePlayer;
  opponent: OfflinePlayer;
  steps?: Array<GameStep>;
  pref?: any;
}

interface OnlineGame {
  fen: string;
  initialFen: string;
  id: string;
  rated: boolean;
  variant: Variant;
  player: Color;
  source: string;
  status: GameStatus;
  turns: number;
  lastMove?: string;
  perf?: string;
  check?: boolean;
  speed?: string;
  startedAtTurn?: number;
  winner?: Color;
  threefold?: boolean;
  tournamentId?: string;
  createdAt?: Timestamp;
}

interface OfflinePlayer {
  color: Color;
  username: string;
}

interface OfflineGame {
  id: string;
  fen: string;
  initialFen: string;
  variant: Variant;
  player: Color;
  source: string;
  status: GameStatus;
  check?: boolean;
  winner?: Color;
  threefold?: boolean;
}

interface StoredOfflineGame {
  data: OfflineGameData;
  situations: Array<GameSituation>;
  ply: number;
}

declare type VariantKey = 'standard' | 'chess960' | 'antichess' | 'fromPosition' | 'kingOfTheHill' | 'threeCheck' | 'atomic' | 'horde' | 'racingKings' | 'crazyhouse';

interface Variant {
  key: VariantKey;
  name: string;
  short: string;
  title: string;
}

interface GameStatus {
  id: number;
  name: string;
}

interface CheckCount {
  white: number;
  black: number;
}

interface Pocket {
  queen: number;
  rook: number;
  knight: number;
  bishop: number;
  pawn: number;
  [role: string]: number;
}

declare type Pockets = [Pocket, Pocket]

interface GameStep {
  ply: number
  fen: string
  san: string
  uci: string
  check: boolean
  checkCount?: CheckCount
  dests?: DestsMap
  crazy?: {
    pockets: Pockets
  }
}

interface GameSituation {
  variant: string
  fen: string
  player: string
  dests: DestsMap
  drops?: Array<string>
  end: boolean
  playable: boolean
  status?: GameStatus
  winner?: Color
  check: boolean
  checkCount: CheckCount
  pgnMoves: Array<string>
  uciMoves: Array<string>
  promotion?: string
  crazyhouse?: Pockets
  ply: number
}

interface Dimensions {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}
