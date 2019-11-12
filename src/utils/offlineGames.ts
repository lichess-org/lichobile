import storage from '../storage'
import asyncStorage from '../asyncStorage'
import { AnalyseData } from '../lichess/interfaces/analyse'
import { NowPlayingGame } from '../lichess/interfaces'
import { OnlineGameData, OfflineGameData } from '../lichess/interfaces/game'
import { GameSituation } from '../chess'

const OTB_STORAGE_KEY = 'otb.current'
const AI_STORAGE_KEY = 'ai.current'
const CORRES_STORAGE_KEY = 'offline.corres.games'

export interface StoredOfflineGame {
  data: OfflineGameData
  situations: Array<GameSituation>
  ply: number
}

export type StoredOfflineGames = { [id: string]: OnlineGameData }

export function getCurrentOTBGame(): Promise<StoredOfflineGame | null> {
  return asyncStorage.get<StoredOfflineGame>(OTB_STORAGE_KEY)
}

export function setCurrentOTBGame(game: StoredOfflineGame): Promise<StoredOfflineGame> {
  return asyncStorage.set(OTB_STORAGE_KEY, game)
}

export function getCurrentAIGame(): Promise<StoredOfflineGame | null> {
  return asyncStorage.get<StoredOfflineGame>(AI_STORAGE_KEY)
}

export function setCurrentAIGame(game: StoredOfflineGame): Promise<StoredOfflineGame> {
  return asyncStorage.set(AI_STORAGE_KEY, game)
}

export function getAnalyseData(data: StoredOfflineGame, orientation: Color): AnalyseData | null {
  if (!data) return null
  const aData = data.data as any
  (aData as AnalyseData).orientation = orientation
  aData.treeParts = data.situations.map((o: GameSituation) => {
    const node = {
      // bc layer TODO remove in version 5.4
      id: o.id || (o as any).nodeId,
      fen: o.fen,
      ply: o.ply,
      check: o.check,
      checkCount: o.checkCount,
      // uciMoves contains at least situation last move
      // bc layer TODO remove in version 5.4
      uci: o.uci || o.uciMoves[o.uciMoves.length - 1],
      san: o.san || o.pgnMoves.length ? o.pgnMoves[o.pgnMoves.length - 1] : undefined,
      dests: o.dests,
      drops: o.drops,
      crazyhouse: o.crazyhouse,
      pgnMoves: o.pgnMoves,
      end: o.end,
      player: o.player,
      children: []
    }
    return node
  })
  return aData as AnalyseData
}

export function getOfflineGames(): Array<OnlineGameData> {
  const stored = storage.get<StoredOfflineGames>(CORRES_STORAGE_KEY)
  let arr: OnlineGameData[] = []
  if (stored) {
    for (const id in stored) {
      arr.push(stored[id])
    }
  }
  return arr
}

let nbOfflineGames: number | undefined
export function hasOfflineGames(): boolean {
  nbOfflineGames =
    nbOfflineGames !== undefined ? nbOfflineGames : getOfflineGames().length

  return nbOfflineGames > 0
}

export function getOfflineGameData(id: string): OnlineGameData | null {
  const stored = storage.get<StoredOfflineGames>(CORRES_STORAGE_KEY)
  return stored && stored[id]
}

export function saveOfflineGameData(id: string, gameData: OnlineGameData): void {
  const stored = storage.get<StoredOfflineGames>(CORRES_STORAGE_KEY) || {}
  const toStore = JSON.parse(JSON.stringify(gameData))
  toStore.player.onGame = false
  toStore.opponent.onGame = false
  if (toStore.player.user) toStore.player.user.online = false
  if (toStore.opponent.user) toStore.opponent.user.online = false
  stored[id] = toStore
  storage.set(CORRES_STORAGE_KEY, stored)
  nbOfflineGames = undefined
}

export function removeOfflineGameData(id: string): void {
  const stored = storage.get<StoredOfflineGames>(CORRES_STORAGE_KEY)
  if (stored && stored[id]) {
    delete stored[id]
    nbOfflineGames = undefined
  }
  storage.set(CORRES_STORAGE_KEY, stored)
}

export function syncWithNowPlayingGames(nowPlaying: Array<NowPlayingGame>): void {
  if (nowPlaying === undefined) return

  const stored = storage.get<StoredOfflineGames>(CORRES_STORAGE_KEY) || {}
  const storedIds = Object.keys(stored)
  const playingIds = nowPlaying.map(g => g.fullId)
  const toRemove = storedIds.filter(x => !playingIds.includes(x))

  if (toRemove.length > 0) {
    toRemove.forEach(id => {
      if (stored && stored[id]) {
        delete stored[id]
      }
    })
    storage.set(CORRES_STORAGE_KEY, stored)
    nbOfflineGames = undefined
  }
}
