declare type Timestamp = number;

declare type StringMap = {
  [i: string]: string;
}

declare type SanChar = 'P' | 'N' | 'B' | 'R' | 'Q'

declare type Color = 'white' | 'black';

declare type VariantKey = 'standard' | 'chess960' | 'antichess' | 'fromPosition' | 'kingOfTheHill' | 'threeCheck' | 'atomic' | 'horde' | 'racingKings' | 'crazyhouse';

declare type Speed = 'bullet' | 'blitz' | 'classical' | 'correspondence' | 'unlimited'
declare type Perf = 'bullet' | 'blitz' | 'classical' | 'correspondence' | 'chess960' | 'antichess' | 'fromPosition' | 'kingOfTheHill' | 'threeCheck' | 'atomic' | 'horde' | 'racingKings' | 'crazyhouse'

declare type Role = 'king' | 'queen' | 'knight' | 'bishop' | 'rook' | 'pawn';

declare type Pos = 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1' | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8';

declare type GameSource = 'lobby' | 'pool' | 'friend' | 'ai' | 'api' | 'tournament' | 'position' | 'import' | 'offline'

declare type MoveTuple = [Pos, Pos]

declare type DestsMap = {
  [index: string]: Array<Pos>
}

interface LichessOptions {
  apiEndPoint: string
  socketEndPoint: string
  mode: string
  version: string
  gaId: string
  gcmSenderId: string
  sentryDSN: string
}

interface Window {
  lichess: LichessOptions
  moment: any
  shouldRotateToOrientation: () => boolean
  handleOpenURL: (url: string) => void
  AppVersion: { version: string }
}

interface PongMessage {
  d: number;
  r: number;
}

interface PlayTime {
  total: number;
  tv: number;
}

interface User {
  booster: boolean;
  engine: boolean;
  patron?: boolean;
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
  profile?: any
}

interface Piece {
  role: Role;
  color: Color;
}

interface Drop {
  role: Role;
  key: Pos;
}

interface Player {
  id: string
  color: Color
  rating?: number
  user?: User
  provisional?: boolean
  username?: string
  name?: string
  ai?: number
  onGame?: boolean
  isGone?: boolean
  offeringDraw?: boolean
  proposingTakeback?: boolean
  offeringRematch?: boolean
  spectator?: boolean
  berserk?: boolean
  version?: number
  checks?: number
  ratingDiff?: number
}

interface TournamentClock {
  limit: number;
  increment: number;
}

interface ClockData {
  black: number
  white: number
  emerg: number
  running: boolean
  initial: number
  increment: number
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

interface BoardPosition {
  name: string
  fen: string
  eco?: string
}

interface BoardPositionCategory {
  name: string
  positions: Array<BoardPosition>
}

interface Opening {
  ply?: number
  eco: string
  name: string
  fen?: string
  wikiPath?: string
}

interface Game {
  id: string
  fen: string
  initialFen: string
  variant: Variant;
  player: Color
  source: GameSource
  status: GameStatus
  winner?: Color
  threefold?: boolean
  speed?: Speed
  startedAtTurn?: number
  rated?: boolean
  turns?: number
  lastMove?: string
  perf?: Perf
  // FIXM
  check?: string | boolean
  tournamentId?: string
  createdAt?: Timestamp
  boosted?: boolean
  rematch?: string
  offline?: boolean
  importedBy?: string
  opening?: Opening
}

interface OnlineGame extends Game {
  rated: boolean
  turns: number
  speed: Speed
  check?: string
  importedBy?: string
}

interface OfflineGame extends Game {
  check?: boolean;
}

interface ChatMsg {
  u: string
  c: Color
  t: string
  r?: boolean
  d?: boolean
}

interface GameData {
  game: Game
  player: Player;
  opponent: Player;
  correspondence?: CorrespondenceClockData;
  clock?: ClockData;
  steps?: Array<GameStep>;
  tournament?: Tournament;
  note?: string;
  chat?: Array<ChatMsg>;
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
  takebackable?: boolean;
}

interface OnlineGameData extends GameData {
  game: OnlineGame;
  takebackable: boolean;
  watchers?: GameWatchers
}

interface GameCrowd {
  white: boolean;
  black: boolean;
  watchers: GameWatchers;
}

interface GameWatchers {
  anons: number;
  nb: number;
  users: Array<string>;
}

interface OfflineGameData extends GameData {
  game: OfflineGame;
  steps?: Array<GameStep>;
}

interface StoredOfflineGame {
  data: OfflineGameData;
  situations: Array<GameSituation>;
  ply: number;
}

interface Variant {
  key: VariantKey
  name: string
  short: string
  title?: string
}

interface GameStatus {
  id: number;
  name: string;
}

interface CheckCount {
  white: number
  black: number
  [color: string]: number
}

interface Pocket {
  queen: number
  rook: number
  knight: number
  bishop: number
  pawn: number
  [role: string]: number
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
  drops?: Array<string>
  crazy?: {
    pockets: Pockets
  }
}

interface GameSituation {
  variant: string
  fen: string
  player: Color;
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
  crazyhouse?: {
    pockets: Pockets
  }
  ply: number
}

interface BoardBounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}
