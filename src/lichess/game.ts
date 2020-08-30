import i18n, { plural } from '../i18n'
import { secondsToMinutes } from '../utils'
import settings from '../settings'
import gameStatus from './status'
import getVariant from './variant'
import { shortPerfTitle } from './perfs'
import { FeaturedGame } from './interfaces'
import { UserGame } from './interfaces/user'
import { GameData, OnlineGameData, Player } from './interfaces/game'
import { AnalyseData, OnlineAnalyseData } from './interfaces/analyse'

export const analysableVariants = ['standard', 'crazyhouse', 'chess960', 'fromPosition', 'kingOfTheHill', 'threeCheck', 'atomic', 'antichess', 'horde', 'racingKings']

export function parsePossibleMoves(dests?: StringMap | string): DestsMap {
  if (!dests) return {}
  const dec: DestsMap = {}
  if (typeof dests === 'string')
    dests.split(' ').forEach(ds => {
      dec[ds.slice(0, 2)] = ds.slice(2).match(/.{2}/g) as Key[]
    })
    else for (let k in dests) dec[k] = dests[k]!.match(/.{2}/g) as Key[]
  return dec
}

export function playable(data: GameData | AnalyseData): boolean {
  return data.game.source !== 'import' && data.game.status.id < gameStatus.ids.aborted
}

export function isPlayerPlaying(data: GameData | AnalyseData) {
  return playable(data) && !data.player.spectator
}

export function isPlayerTurn(data: GameData) {
  return isPlayerPlaying(data) && data.game.player === data.player.color
}

export function isOpponentTurn(data: GameData) {
  return isPlayerPlaying(data) && data.game.player !== data.player.color
}

export function mandatory(data: OnlineGameData) {
  return !!data.tournament
}

export function playedTurns(data: OnlineGameData | AnalyseData) {
  return data.game.turns - (data.game.startedAtTurn || 0)
}

export function bothPlayersHavePlayed(data: OnlineGameData): boolean {
  return playedTurns(data) > 1
}

export function abortable(data: OnlineGameData) {
  return playable(data) && !bothPlayersHavePlayed(data) && !mandatory(data)
}

export function takebackable(data: OnlineGameData): boolean {
  return !!(playable(data) && data.takebackable && !data.tournament && playedTurns(data) > 1 && !data.player.proposingTakeback && !data.opponent.proposingTakeback)
}

export function drawable(data: OnlineGameData) {
  return playable(data) && data.game.turns >= 2 && !data.player.offeringDraw && !data.opponent.ai && !data.opponent.offeringDraw
}

export function berserkableBy(data: OnlineGameData) {
  return data.tournament &&
    data.tournament.berserkable &&
    isPlayerPlaying(data) &&
    playedTurns(data) < 2
}

export function resignable(data: OnlineGameData) {
  return playable(data) && !abortable(data)
}

export function forceResignable(data: OnlineGameData) {
  return !data.opponent.ai && data.clock && data.opponent.isGone && resignable(data)
}

export function moretimeable(data: OnlineGameData) {
  return data.clock && isPlayerPlaying(data) && !mandatory(data)
}

export function imported(data: GameData | AnalyseData) {
  return data.game.source === 'import'
}

export function replayable(data: GameData | AnalyseData) {
  return imported(data) || gameStatus.finished(data)
}

export function userAnalysable(data: GameData) {
  return settings.analyse.supportedVariants.indexOf(data.game.variant.key) !== -1 && playable(data) && (!data.clock || !isPlayerPlaying(data))
}

export function analysable(data: OnlineGameData | OnlineAnalyseData) {
  return replayable(data) && playedTurns(data) > 4 && analysableVariants.indexOf(data.game.variant.key) !== -1
}

export function getPlayer(data: GameData | AnalyseData, color?: Color): Player | undefined {
  if (data.player.color === color) return data.player
  if (data.opponent.color === color) return data.opponent
}

export function setIsGone(data: GameData, color: Color, isGone: boolean) {
  const player = getPlayer(data, color)
  if (player) {
    isGone = isGone && !player.ai
    player.isGone = isGone
    if (!isGone && player.user) player.user.online = true
  }
}

export function setOnGame(data: GameData, color: Color, onGame: boolean) {
  const player = getPlayer(data, color)
  if (player) {
    onGame = onGame || !!player.ai
    player.onGame = onGame
    if (onGame) setIsGone(data, color, false)
  }
}

export function nbMoves(data: OnlineGameData, color: Color) {
  return Math.floor((data.game.turns + (color === 'white' ? 1 : 0)) / 2)
}

export function result(data: GameData) {
  if (gameStatus.finished(data)) switch (data.game.winner) {
    case 'white':
      return '1-0'
    case 'black':
      return '0-1'
    default:
      return '½-½'
  }
  return '*'
}

// FIXME
export function time(data: GameData | UserGame | AnalyseData | FeaturedGame) {
  if (data.clock) {
    const min = secondsToMinutes(data.clock.initial)
    const t = min === 0.25 ? '¼' : min === 0.5 ? '½' : min === 0.75 ? '¾' : min.toString()
    return t + '+' + data.clock.increment
  }
  else if (data.correspondence) {
    return plural('nbDays', data.correspondence.daysPerTurn)
  }
  else {
    return '∞'
  }
}

export function title(data: GameData | AnalyseData): string {
  const mode = data.game.offline ?
    i18n('offline') :
    data.game.rated ? i18n('rated') : i18n('casual')

  const perf = data.game.perf && shortPerfTitle(data.game.perf)
  const variant = getVariant(data.game.variant.key)
  const name = perf || (variant ? (variant.tinyName || variant.shortName || variant.name) : '?')
  const t = time(data)
  return data.game.source === 'import' ?
    'Import • Standard' :
    `${t} • ${name} • ${mode}`
}

export function publicUrl(data: GameData) {
  return 'https://lichess.org/' + data.game.id
}

export function publicAnalyseUrl(data: AnalyseData) {
  return 'https://lichess.org/' + data.game.id + '/' + data.orientation
}

export function isSupportedVariant(data: GameData) {
  return settings.game.supportedVariants.indexOf(data.game.variant.key) !== -1
}
