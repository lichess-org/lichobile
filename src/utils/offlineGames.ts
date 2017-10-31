import storage from '../storage'
import * as cloneDeep from 'lodash/cloneDeep'
import * as difference from 'lodash/difference'
import { AnalyseData } from '../lichess/interfaces/analyse'
import { NowPlayingGame } from '../lichess/interfaces'
import { OnlineGameData, OfflineGameData } from '../lichess/interfaces/game'
import { GameSituation } from '../chess'

const otbStorageKey = 'otb.current'
const aiStorageKey = 'ai.current'

export interface StoredOfflineGame {
  data: OfflineGameData
  situations: Array<GameSituation>
  ply: number
}

export type StoredOfflineGames = { [id: string]: OnlineGameData }

export function getCurrentOTBGame(): StoredOfflineGame | null {
  return storage.get<StoredOfflineGame>(otbStorageKey)
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

export function setCurrentOTBGame(game: StoredOfflineGame): void {
  storage.set(otbStorageKey, game)
}

export function getCurrentAIGame(): StoredOfflineGame | null {
  return storage.get<StoredOfflineGame>(aiStorageKey)
}

export function setCurrentAIGame(game: StoredOfflineGame): void {
  storage.set(aiStorageKey, game)
}

const offlineCorresStorageKey = 'offline.corres.games'

export function getOfflineGames(): Array<OnlineGameData> {
  const stored = storage.get<StoredOfflineGames>(offlineCorresStorageKey)
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
  const stored = storage.get<StoredOfflineGames>(offlineCorresStorageKey)
  return stored && stored[id]
}

export function saveOfflineGameData(id: string, gameData: OnlineGameData) {
  const stored = storage.get<StoredOfflineGames>(offlineCorresStorageKey) || {}
  const toStore = cloneDeep(gameData)
  toStore.player.onGame = false
  toStore.opponent.onGame = false
  if (toStore.player.user) toStore.player.user.online = false
  if (toStore.opponent.user) toStore.opponent.user.online = false
  stored[id] = toStore
  storage.set(offlineCorresStorageKey, stored)
  nbOfflineGames = undefined
}

export function removeOfflineGameData(id: string) {
  const stored = storage.get<StoredOfflineGames>(offlineCorresStorageKey)
  if (stored && stored[id]) {
    delete stored[id]
    nbOfflineGames = undefined
  }
  storage.set(offlineCorresStorageKey, stored)
}

export function syncWithNowPlayingGames(nowPlaying: Array<NowPlayingGame>) {
  if (nowPlaying === undefined) return

  const stored = storage.get<StoredOfflineGames>(offlineCorresStorageKey) || {}
  const storedIds = Object.keys(stored)
  const toRemove = difference(storedIds, nowPlaying.map((g: NowPlayingGame) => g.fullId))

  if (toRemove.length > 0) {
    toRemove.forEach(id => {
      if (stored && stored[id]) {
        delete stored[id]
      }
    })
    storage.set(offlineCorresStorageKey, stored)
    nbOfflineGames = undefined
  }
}
