import { AnalyseDataForForecast, ForecastStep, MinimalForecastStep } from '~/lichess/interfaces/forecast'
import router from '~/router'
import redraw from '~/utils/redraw'
import { playAndSaveForecasts, saveForecasts } from './xhr'

const MAX_FORECAST_PLIES = 30

export default class ForecastCtrl {
  readonly isMyTurn: boolean

  private _lines: ForecastStep[][]
  private _contextIndex: number | null
  private readonly _gameId: string
  private readonly _playerId: string | null
  private readonly _analyseUrl?: string

  constructor(data: AnalyseDataForForecast) {
    const forecastData = data.forecast
    this._lines = forecastData?.steps || []
    const onMyTurn = forecastData?.onMyTurn
    this.isMyTurn = !!onMyTurn
    this._contextIndex = null
    this._gameId = data.game.id
    this._playerId = data.player?.id || null
    this._analyseUrl = data.url?.round
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

    const isPrefix = this._lines.find((existingForecast) => {
      return this.isPrefix(existingForecast, forecastCandidate)
    })

    return !isPrefix
  }

  removeIndex(index: number): void {
    this._lines = this._lines.filter((_, i) => i !== index)
    this.contextIndex = null
    this.save()
  }

  add(line: ForecastStep[]): void {
    const candidate = this.truncate(line)
    if (!this.isCandidate(candidate)) return

    this._lines.push(candidate)
    this.fixAll()
    this.save()
  }

  save(): void {
    const playerId = this._playerId
    const gameId = this._gameId
    if (this.isMyTurn || !playerId) return
    // loading(true);
    redraw()
    saveForecasts(gameId, playerId, this.lines).then(data => {
      if (data.reload) {
        this.reloadToLastPly()
      } else {
        // loading(false);
        this._lines = data.steps || []
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

    playAndSaveForecasts(gameId, playerId, moveToPlay, forecasts)
      .then(data => {
        if (data.reload) {
          this.reloadToLastPly()
        } else {
          this._lines = data.steps || []
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
    router.set(`/analyse/online${this._analyseUrl}`)
  }

  get lines(): ForecastStep[][] {
    return this._lines
  }

  get contextIndex(): number | null {
    return this._contextIndex
  }

  set contextIndex(index: number | null) {
    if (index != null && (index < 0 || index >= this.lines.length)) return

    this._contextIndex = index
  }

  /**
   * @returns whether the given forecast line is a prefix (up to equality) of the other line.
   *          For example, the line (1. e4) and (1. e4 e5) are prefixes of (1. e4 e5).
   */
  isPrefix(line: MinimalForecastStep[], possiblePrefix: MinimalForecastStep[]): boolean {
    return (
      line.length >= possiblePrefix.length && this.keyOf(line).startsWith(this.keyOf(possiblePrefix))
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

  private keyOf(fc: MinimalForecastStep[]): string {
    return fc.map((node) => node.ply + ':' + node.uci).join(',')
  }

  private isLongEnough(fc: MinimalForecastStep[]): boolean {
    return fc.length >= (this.isMyTurn ? 1 : 2)
  }

  /**
   * Consolidates all forecasts such that none of them are contradictory and none of them are prefixes of another.
   */
  private fixAll(): void {
    this._lines = this._lines.filter((line, i) => {
      const issue = this._lines.find((otherLine, j) => {
        return (
          (i !== j && this.isPrefix(otherLine, line))
          || (i < j && (this.collides(line, otherLine)))
        )
      })
      return !issue
    })
  }
}
