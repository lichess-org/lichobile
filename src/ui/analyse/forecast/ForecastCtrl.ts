import { ForecastStep } from "~/lichess/interfaces/forecast";

export default class ForecastCtrl {
  private _lines: ForecastStep[][]

  constructor(
    lines?: ForecastStep[][]
  ) {
    this._lines = lines || []
  }

  /**
   * @returns whether the given forecast nodes are part of a new candidate premove line that does not
   *          overlap with other saved conditional premove lines.
   */
  isCandidate(nodes: ForecastStep[]): boolean {
    return nodes.length % 2 == 0; // TODO
  }

  save() {
    // TODO
  }

  get lines(): ForecastStep[][] {
    return this._lines;
  }
}
