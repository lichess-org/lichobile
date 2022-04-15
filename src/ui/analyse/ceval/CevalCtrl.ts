import settings from '../../../settings'
import { Tree } from '../../shared/tree'
import StockfishClient from './StockfishClient'
import { Opts, Work, Started } from './interfaces'
import { povChances } from './winningChances'

export default class CevalCtrl {
  public readonly minDepth = 6
  public readonly allowed: boolean
  public readonly variant: VariantKey

  private initialized = false
  private engine: StockfishClient
  private started = false
  public isDeeper = false
  private lastStarted: Started | undefined = undefined
  private isEnabled: boolean

  constructor(
    readonly opts: Opts,
    readonly emit: (path: string, ev?: Tree.ClientEval, isThreat?: boolean) => void,
  ) {
    this.allowed = opts.allowed
    this.variant = opts.variant
    this.isEnabled = settings.analyse.enableCeval()
    this.engine = new StockfishClient(opts.variant, opts.cores, opts.hashSize)
  }

  public enabled(): boolean {
    return this.opts.allowed && this.isEnabled
  }

  public init = (): Promise<void> => {
    return this.engine.init().then(() => {
      this.initialized = true
    })
  }

  public async start(threatMode: boolean, path: Tree.Path, nodes: Tree.Node[], forceMaxLevel: boolean, deeper: boolean): Promise<void> {
    if (!this.enabled()) {
      return
    }
    this.isDeeper = deeper
    const step = nodes[nodes.length - 1]
    const maxDepth = this.effectiveMaxDepth(deeper)
    const existing = threatMode ? step.threat : step.ceval
    if (existing && existing.depth >= maxDepth) {
      return
    }
    const work: Work = {
      initialFen: nodes[0].fen,
      currentFen: step.fen,
      moves: [],
      maxDepth: forceMaxLevel ? settings.analyse.cevalMaxDepth() : this.effectiveMaxDepth(deeper),
      path,
      ply: step.ply,
      multiPv: forceMaxLevel ? 1 : this.opts.multiPv,
      threatMode,
      emit: (ev?: Tree.ClientEval) => {
        if (this.enabled()) this.onEmit(work, ev)
      },
    }

    if (threatMode) {
      const c = step.ply % 2 === 1 ? 'w' : 'b'
      const fen = step.fen.replace(/ (w|b) /, ' ' + c + ' ')
      work.currentFen = fen
      work.initialFen = fen
    } else {
      // send fen after latest castling move and the following moves
      for (let i = 1; i < nodes.length; i++) {
        const s = nodes[i]
        if (sanIrreversible(this.variant, s.san!)) {
          work.moves = []
          work.initialFen = s.fen
        } else work.moves.push(s.uci!)
      }
    }

    this.engine.start(work)
    this.started = true
    this.lastStarted = {
      threatMode,
      path,
      nodes,
    }
  }

  // Useful if/when options change while analysis is running.
  public restart(): void {
    if (this.lastStarted) {
      void this.start(this.lastStarted.threatMode, this.lastStarted.path, this.lastStarted.nodes, false, false)
    }
  }

  public isInit(): boolean {
    return this.initialized
  }

  public isSearching(): boolean {
    return this.engine.isSearching()
  }

  public destroy = (): void => {
    if (this.initialized) {
      this.engine.exit()
      .then(() => {
        this.initialized = false
        this.started = false
      })
      .catch(() => {
        this.initialized = false
        this.started = false
      })
    }
  }

  public stop = (): void => {
    if (!this.enabled() || !this.started) return
    this.engine.stop()
    this.started = false
  }

  public toggle = (): void => {
    this.isEnabled = !this.isEnabled
  }

  public disable = (): void => {
    this.isEnabled = false
  }

  public setMultiPv(pv: number): void {
    this.opts.multiPv = pv
    this.restart()
  }

  public getMultiPv(): number {
    return this.opts.multiPv
  }

  public toggleInfinite = (): void => {
    this.opts.infinite = !this.opts.infinite
    this.restart()
  }

  public goDeeper = (): void => {
    if (this.lastStarted) {
      this.start(this.lastStarted.threatMode, this.lastStarted.path, this.lastStarted.nodes, false, true)
    }
  }

  public canGoDeeper(): boolean {
    return !this.isDeeper && !this.opts.infinite && !this.engine.isSearching()
  }

  public getEngineName(): string {
    return this.engine.engineName
  }

  public getEngineEvaluation(): string | undefined {
    return this.engine.evaluation
  }

  public effectiveMaxDepth(deeper = false): number {
    return (deeper || this.opts.infinite) ? 99 : settings.analyse.cevalMaxDepth()
  }

  private onEmit = (work: Work, ev?: Tree.ClientEval) => {
    if (ev) sortPvsInPlace(ev.pvs, (work.ply % 2 === 0) ? 'white' : 'black')
    if (ev) npsRecorder(ev)
    this.emit(work.path, ev, work.threatMode)
  }
}

function median(values: number[]): number {
  values.sort((a, b) => a - b)
  const half = Math.floor(values.length / 2)
  return values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2.0
}

// stockfish does not always sort pvs
function sortPvsInPlace(pvs: Tree.PvData[], color: Color) {
  return pvs.sort((a, b) => {
    return povChances(color, b) - povChances(color, a)
  })
}

const npsRecorder = (() => {
  const values: number[] = []
  const applies = (ev: Tree.ClientEval) => {
    return ev.knps && ev.depth >= 16 &&
      ev.cp !== undefined && Math.abs(ev.cp) < 500 &&
      (ev.fen.split(/\s/)[0].split(/[nbrqkp]/i).length - 1) >= 10
  }
  return (ev: Tree.ClientEval) => {
    if (!applies(ev)) return
    values.push(ev.knps!)
    if (values.length > 9) {
      const knps = median(values) || 0
      let depth = 18
      if (knps > 100) depth = 19
      if (knps > 150) depth = 20
      if (knps > 250) depth = 21
      if (knps > 500) depth = 22
      if (knps > 1000) depth = 23
      if (knps > 2000) depth = 24
      if (knps > 3500) depth = 25
      if (knps > 5000) depth = 26
      if (knps > 7000) depth = 27
      if (settings.analyse.cevalMaxDepth() !== depth) {
        settings.analyse.cevalMaxDepth(depth)
      }
      if (values.length > 40) values.shift()
    }
  }
})()

export function sanIrreversible(variant: VariantKey, san: string): boolean {
  if (san.startsWith('O-O')) return true
  if (variant === 'crazyhouse') return false
  if (san.includes('x')) return true // capture
  if (san.toLowerCase() === san) return true // pawn move
  return variant === 'threeCheck' && san.includes('+')
}
