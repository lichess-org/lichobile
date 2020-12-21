import { ForecastStep } from "~/lichess/interfaces/forecast";
import redraw from "~/utils/redraw";

export default class ForecastCtrl {
  private _lines: ForecastStep[][]
  private _contextIndex: number | null

  constructor(
    lines?: ForecastStep[][]
  ) {
    this._lines = lines || []
    this._contextIndex = null
  }

  /**
   * @returns whether the given forecast nodes are part of a new candidate premove line that does not
   *          overlap with other saved conditional premove lines.
   */
  isCandidate(nodes: ForecastStep[]): boolean {
    return nodes.length % 2 == 0; // TODO
  }

  removeIndex(index: number): void {
    this._lines = this._lines.filter((_, i) => i !== index)
    this.contextIndex = null
    this.save()
  }

  save() {
    // TODO
    redraw()
  }

  get lines(): ForecastStep[][] {
    return this._lines;
  }

  get contextIndex(): number | null {
    return this._contextIndex
  }

  set contextIndex(index: number | null) {
    if (index != null && (index < 0 || index >= this.lines.length)) return

    this._contextIndex = index
  }
}
