import { AnalyseDataForForecast, ForecastStep, MinimalForecastStep } from '~/lichess/interfaces/forecast'
import router from '~/router'
import redraw from '~/utils/redraw'
import { playAndSaveForecasts, saveForecasts } from './xhr'

const MAX_FORECAST_PLIES = 30

type SanMap = Map<string, ForecastStep[]>

function linesToSanMap(lines: ForecastStep[][]): SanMap {
  return lines.reduce((map, line) => {
    return map.set(keyOf(line), line)
  }, new Map())
}

export function keyOf(fc: MinimalForecastStep[]): string {
  return fc.map((node) => node.ply + ':' + node.uci).join(',')
}

export default class ForecastCtrl {
  public focusKey: string | null = null
  public loading = false
  readonly isMyTurn: boolean

  private _lines: SanMap
  private readonly _gameId: string
  private readonly _playerId: string | null
  private _minimized = false

  constructor(data: AnalyseDataForForecast) {
    const forecastData = data.forecast
    this._lines = linesToSanMap(forecastData?.steps || [])
    const onMyTurn = forecastData?.onMyTurn
    this.isMyTurn = !!onMyTurn
    this._gameId = data.game.id
    this._playerId = data.player?.id || null
  }

  /**
   * @returns the given line forecast steps, truncated to a reasonable length and ending
   *          with the viewing player's move.
   */
  truncate<T extends MinimalForecastStep>(nodes: T[]): T[] {
    const requiredPlyMod = this.isMyTurn ? 1 : 0

    // must end with player move
    return (nodes.length % 2 !== requiredPlyMod ? nodes.slice(0, -1) : nodes).slice(0, MAX_FORECAST_PLIES)
  }

  /**
   * @returns whether the given forecast nodes are part of a new candidate premove line that is not
   *          a prefix of the other saved conditional premove lines.
   */
  isCandidate(nodes: MinimalForecastStep[]): boolean {
    const forecastCandidate = this.truncate(nodes)
    if (!this.isLongEnough(forecastCandidate)) return false

    for (const existingForecast of this._lines.values()) {
      if (this.isPrefix(existingForecast, forecastCandidate)) {
        return false
      }
    }

    return true
  }

  removeForecast(key: string): void {
    this._lines.delete(key)
    this.focusKey = null
    this.save()
  }

  add(line: ForecastStep[]): void {
    const candidate = this.truncate(line)
    if (!this.isCandidate(candidate)) return

    this._lines.set(keyOf(candidate), candidate)
    this.fixAll()
    this.save()
  }

  save(): void {
    const playerId = this._playerId
    const gameId = this._gameId
    if (this.isMyTurn || !playerId) return
    this.loading = true
    redraw()
    saveForecasts(gameId, playerId, this.lines).then(data => {
      if (data.reload) {
        this.reloadToLastPly()
      } else {
        this.loading = false
        this._lines = linesToSanMap(data.steps || [])
        redraw()
      }
    })
  }

  playAndSave(moveToPlay: ForecastStep): void {
    const playerId = this._playerId
    const gameId = this._gameId
    if (!this.isMyTurn || !playerId) return

    const forecasts = this.findStartingWithNode(moveToPlay)
      .filter(forecast => forecast.length > 0)
      .map(forecast => forecast.slice(1))

    this.loading = true
    redraw()
    playAndSaveForecasts(gameId, playerId, moveToPlay, forecasts)
      .then(data => {
        if (data.reload) {
          this.reloadToLastPly()
        } else {
          this.loading = false
          this._lines = linesToSanMap(data.steps || [])
          redraw()
        }
      })
  }

  findStartingWithNode(node: ForecastStep): ForecastStep[][] {
    return this.lines.filter((candidate) => {
      return this.isPrefix(candidate, [node])
    })
  }

  reloadToLastPly(): void {
    router.deleteQueryParam('ply', true)
  }

  get lines(): ForecastStep[][] {
    return Array.from(this._lines.values())
  }

  /**
   * @returns whether the given forecast line is a prefix (up to equality) of the other line.
   *          For example, the line (1. e4) and (1. e4 e5) are prefixes of (1. e4 e5).
   */
  isPrefix(line: MinimalForecastStep[], possiblePrefix: MinimalForecastStep[]): boolean {
    return (
      line.length >= possiblePrefix.length && keyOf(line).startsWith(keyOf(possiblePrefix))
    )
  }

  /**
   * Two forecasts are considered to collide if the current player cannot theoretically play both of them.
   * For example, for black, 1. e4 e5 and 1. e4 c5 are colliding forecasts, as black cannot play both e5 and c5
   * in response to e4. However, for white, 1. e4 e5 and 1. e4 c5 are not colliding forecasts.
   *
   * If it is the current player's turn, divergences on the first forecasted move are not considered to collide.
   * For example, 2. e4 and 2. d4 are not collisions on white's turn.
   */
  collides(fc1: MinimalForecastStep[], fc2: MinimalForecastStep[]): boolean {
    for (let i = 0, max = Math.min(fc1.length, fc2.length); i < max; i++) {
      if (fc1[i].uci !== fc2[i].uci) {
        if (this.isMyTurn) {
          return i !== 0 && i % 2 === 0
        }
        return i % 2 === 1
      }
    }
    /**
     * If the two forecast lines are the same up to the length of the smaller one, they are not considered
     * to be contradictory, but the smaller is considered a prefix of the larger. @see {isPrefix}
     */
    return false
  }

  toggleMinimized(): void {
    this._minimized = !(this._minimized)
  }

  get minimized(): boolean {
    return this._minimized
  }

  private isLongEnough(fc: MinimalForecastStep[]): boolean {
    return fc.length >= (this.isMyTurn ? 1 : 2)
  }

  /**
   * Consolidates all forecasts such that none of them are contradictory and none of them are prefixes of another.
   */
  private fixAll(): void {
    for (const [key, line] of this._lines.entries()) {
      // Since iteration occurs in the order of insertion, if a newer entry conflicts with an older one,
      // the older one will be removed.
      for (const [otherKey, otherLine] of this._lines.entries()) {
        if (key !== otherKey && this.isPrefix(otherLine, line) || this.collides(line, otherLine)) {
          this._lines.delete(key)
          break
        }
      }
    }
  }
}
