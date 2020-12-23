import { ForecastStep } from "~/lichess/interfaces/forecast";
import redraw from "~/utils/redraw";

export default class ForecastCtrl {
  private _lines: ForecastStep[][];
  private _contextIndex: number | null;

  constructor(lines?: ForecastStep[][]) {
    this._lines = lines || [];
    this._contextIndex = null;
  }

  /**
   * @returns the given line forecast steps, truncated to a reasonable length and ending
   *          with the viewing player's move.
   */
  truncate(nodes: ForecastStep[]): ForecastStep[] {
    // TODO: if (cfg.onMyTurn)
    // return (fc.length % 2 !== 1 ? fc.slice(0, -1) : fc).slice(0, 30);

    // must end with player move
    return (nodes.length % 2 !== 0 ? nodes.slice(0, -1) : nodes).slice(0, 30);
  }

  /**
   * @returns whether the given forecast nodes are part of a new candidate premove line that does not
   *          overlap with other saved conditional premove lines.
   */
  isCandidate(nodes: ForecastStep[]): boolean {
    const forecastCandidate = this.truncate(nodes);
    if (!this.isLongEnough(forecastCandidate)) return false;

    const collided = this._lines.find((existingForecast) => {
      return this.isPrefix(existingForecast, forecastCandidate);
    });

    return !collided;
  }

  removeIndex(index: number): void {
    this._lines = this._lines.filter((_, i) => i !== index);
    this.contextIndex = null;
    this.save();
  }

  add(line: ForecastStep[]): void {
    const candidate = this.truncate(line);
    if (!this.isCandidate(candidate)) return;

    this._lines.push(candidate);
    this.fixAll();
    this.save();
  }

  save() {
    // TODO
    redraw();
  }

  get lines(): ForecastStep[][] {
    return this._lines;
  }

  get contextIndex(): number | null {
    return this._contextIndex;
  }

  set contextIndex(index: number | null) {
    if (index != null && (index < 0 || index >= this.lines.length)) return;

    this._contextIndex = index;
  }

  private keyOf(fc: ForecastStep[]): string {
    return fc.map((node) => node.ply + ":" + node.uci).join(",");
  }

  /**
   * @returns whether the given forecast line is a prefix (up to equality) of the other line.
   *          For example, the line (1. e4) and (1. e4 e5) are prefixes of (1. e4 e5).
   */
  private isPrefix(line: ForecastStep[], possiblePrefix: ForecastStep[]): boolean {
    return (
      line.length >= possiblePrefix.length && this.keyOf(line).startsWith(this.keyOf(possiblePrefix))
    );
  }

  /**
   * Two forecasts are considered to collide if the current player cannot theoretically play both of them.
   * For example, for black, 1. e4 e5 and 1. e4 c5 are colliding forecasts, as black cannot play both e5 and c5
   * in response to e4.
   */
  private collides(fc1: ForecastStep[], fc2: ForecastStep[]): boolean {
    for (let i = 0, max = Math.min(fc1.length, fc2.length); i < max; i++) {
      if (fc1[i].uci !== fc2[i].uci) {
        // TODO if (cfg.onMyTurn) return i !== 0 && i % 2 === 0;
        return i % 2 === 1;
      }
    }
    /**
     * If the two forecast lines are the same up to the length of the smaller one, they are not considered
     * to be contradictory, but the smaller is considered a prefix of the larger. See {@link isPrefix}.
     */
    return false;
  }

  private isLongEnough(fc: ForecastStep[]): boolean {
    // TODO: return fc.length >= (cfg.onMyTurn ? 1 : 2);
    return fc.length >= 2;
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
