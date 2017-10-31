import { askWorker } from './utils/worker'
import { GameStatus, CheckCount, Pockets } from './lichess/interfaces/game'
import { VariantKey, Variant } from './lichess/interfaces/variant'

const worker = new Worker('vendor/scalachess.js')

// warmup
worker.postMessage({ topic: 'init', payload: { variant: 'standard'}})

export interface GameSituation {
  id: string
  ply: number
  variant: string
  fen: string
  player: Color
  dests: DestsMap
  drops?: Array<string>
  end: boolean
  playable: boolean
  status?: GameStatus
  winner?: Color
  check: boolean
  checkCount?: CheckCount
  san?: San
  uci?: Uci
  pgnMoves: Array<string>
  uciMoves: Array<string>
  promotion?: string
  crazyhouse?: {
    pockets: Pockets
  }
}

export interface InitRequest {
  variant: VariantKey
  fen?: string
}

export interface InitResponse {
  variant: Variant
  setup: GameSituation
}

export interface DestsRequest {
  variant: VariantKey
  fen: string
  path?: string
}

export interface DestsResponse {
  dests: DestsMap
  path: string
}

export interface SituationRequest {
  variant: VariantKey
  fen: string
  path?: string
}

export interface SituationResponse {
  situation: GameSituation
  path: string
}

export interface MoveRequest {
  variant: VariantKey
  fen: string
  orig: Key
  dest: Key
  pgnMoves?: Array<string>
  uciMoves?: Array<string>
  promotion?: Role
  path?: string
}

export interface MoveResponse {
  situation: GameSituation
  path?: string
}

export interface DropRequest {
  variant: VariantKey
  fen: string
  pos: Key
  role: Role
  pgnMoves?: Array<string>
  uciMoves?: Array<string>
  path?: string
}

export interface ThreefoldTestRequest {
  variant: VariantKey
  initialFen: string
  pgnMoves: Array<string>
}

export interface ThreefoldTestResponse {
  threefoldRepetition: boolean
  status: GameStatus
}

export interface PgnDumpRequest {
  variant: VariantKey
  initialFen: string
  pgnMoves: Array<string>
  white?: string
  black?: string
  date?: string
}

export interface PgnDumpResponse {
  pgn: string
}

export interface PgnReadRequest {
  pgn: string
}

export interface PgnReadResponse {
  variant: Variant
  setup: GameSituation
  replay: Array<GameSituation>
}

function uniqId() {
  return String(performance.now())
}

export function init(payload: InitRequest): Promise<InitResponse> {
  return askWorker(worker, { topic: 'init', payload })
}

export function dests(payload: DestsRequest): Promise<DestsResponse> {
  return askWorker(worker, { topic: 'dests', payload, reqid: uniqId() })
}

export function situation(payload: SituationRequest): Promise<SituationResponse> {
  return askWorker(worker, { topic: 'situation', payload, reqid: uniqId() })
}

export function move(payload: MoveRequest): Promise<MoveResponse> {
  return askWorker(worker, { topic: 'move', payload, reqid: uniqId() })
}

export function drop(payload: DropRequest): Promise<MoveResponse> {
  return askWorker(worker, { topic: 'drop', payload, reqid: uniqId() })
}

export function threefoldTest(payload: ThreefoldTestRequest): Promise<ThreefoldTestResponse> {
  return askWorker(worker, { topic: 'threefoldTest', payload })
}

export function pgnDump(payload: PgnDumpRequest): Promise<PgnDumpResponse> {
  return askWorker(worker, { topic: 'pgnDump', payload })
}

export function pgnRead(payload: PgnReadRequest): Promise<PgnReadResponse> {
  return askWorker(worker, { topic: 'pgnRead', payload })
}
