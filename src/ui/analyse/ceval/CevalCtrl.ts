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
  private isDeeper = false
  private lastStarted: Started | undefined = undefined
  private isEnabled: boolean

  constructor(
    readonly opts: Opts,
    readonly emit: (path: string, ev?: Tree.ClientEval) => void,
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

  public async start(path: Tree.Path, nodes: Tree.Node[], forceMaxLevel: boolean, deeper: boolean): Promise<void> {
    if (!this.enabled()) {
      return
    }
    this.isDeeper = deeper
    const step = nodes[nodes.length - 1]
    const maxDepth = this.effectiveMaxDepth(deeper)
    if (step.ceval && step.ceval.depth >= maxDepth) {
      return
    }
    const work = {
      initialFen: nodes[0].fen,
      currentFen: step.fen,
      moves: nodes.slice(1).map((s) => fixCastle(s.uci!, s.san!)),
      maxDepth: forceMaxLevel ? settings.analyse.cevalMaxDepth() : this.effectiveMaxDepth(deeper),
      path,
      ply: step.ply,
      multiPv: forceMaxLevel ? 1 : this.opts.multiPv,
      threatMode: false,
      useNNUE: settings.analyse.cevalUseNNUE(),
      emit: (ev?: Tree.ClientEval) => {
        if (this.enabled()) this.onEmit(work, ev)
      }
    }

    this.engine.start(work)
    this.started = true
    this.lastStarted = {
      path,
      nodes,
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
  }

  public getMultiPv(): number {
    return this.opts.multiPv
  }

  public toggleInfinite = (): void => {
    this.opts.infinite = !this.opts.infinite
  }

  public goDeeper = (): void => {
    if (this.lastStarted) {
      this.start(this.lastStarted.path, this.lastStarted.nodes, false, true)
    }
  }

  public canGoDeeper(): boolean {
    return !this.isDeeper && !this.opts.infinite && !this.engine.isSearching()
  }

  public getEngineName(): string {
    return this.engine.engineName
  }

  public getEngineEvaluation(): string {
    return this.engine.evaluation
  }

  public effectiveMaxDepth(deeper = false): number {
    return (deeper || this.opts.infinite) ? 99 : settings.analyse.cevalMaxDepth()
  }

  private onEmit = (work: Work, ev?: Tree.ClientEval) => {
    if (ev) sortPvsInPlace(ev.pvs, (work.ply % 2 === 0) ? 'white' : 'black')
    if (ev) npsRecorder(ev)
    this.emit(work.path, ev)
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

function fixCastle(uci: string, san: string) {
  if (san.indexOf('O-O') !== 0) return uci
  switch (uci) {
    case 'e1h1':
      return 'e1g1'
    case 'e1a1':
      return 'e1c1'
    case 'e8h8':
      return 'e8g8'
    case 'e8a8':
      return 'e8c8'
  }
  return uci
}
