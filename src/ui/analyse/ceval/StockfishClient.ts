import { Capacitor } from '@capacitor/core'
import { StockfishPlugin } from '../../../stockfish'
import { defer, Deferred } from '../../../utils/defer'
import * as Tree from '../../shared/tree/interfaces'
import { Work } from './interfaces'

const EVAL_REGEX = new RegExp(''
  + /^info depth (\d+) seldepth \d+ multipv (\d+) /.source
  + /score (cp|mate) ([-\d]+) /.source
  + /(?:(upper|lower)bound )?nodes (\d+) nps \S+ /.source
  + /(?:hashfull \d+ )?(?:tbhits \d+ )?time (\S+) /.source
  + /pv (.+)/.source)

export default class StockfishClient {
  private readonly stockfish: StockfishPlugin
  private stopTimeoutId?: number
  private work?: Work
  private curEval?: Tree.ClientEval
  private expectedPvs = 1

  // after a 'go' command, stockfish will be continue to emit until the 'bestmove'
  // message, reached by depth or after a 'stop' command
  // a fulfilled ready means stockfish has emited 'bestmove' and is ready for
  // another command
  private ready: Deferred<void>
  // we may have several start requests queued while we wait for previous
  // eval to complete
  private startQueue: Work[] = []
  // stopped flag is true when a search has been interrupted before its end
  private stopped = false

  public engineName = 'Stockfish'
  public evaluation?: string

  constructor(
    variant: VariantKey,
    readonly threads: number,
    readonly hash: number,
  ) {
    this.stockfish = new StockfishPlugin(variant)
    this.ready = defer()
    this.ready.resolve()
  }

  /*
   * Init engine with default options and variant
   */
  public init = async (): Promise<void> => {
    try {
      window.addEventListener('stockfish', this.listener, { passive: true })
      const obj = await this.stockfish.start()
      this.engineName = obj.engineName
      await this.stockfish.setVariant()
      await this.stockfish.setOption('UCI_AnalyseMode', 'true')
      await this.stockfish.setOption('Threads', this.threads)
      if (Capacitor.getPlatform() !== 'web') {
        await this.stockfish.setOption('Hash', this.hash)
      }
    } catch (err: unknown) {
      console.error('stockfish init error', err)
    }
  }

  /*
   * Stop current command if not already stopped, then add a search command to
   * the queue.
   * The search will start when stockfish is ready (after reinit if it takes more
   * than 10s to stop current search)
   */
  public start = (work: Work): Promise<void> => {
    this.stop()
    this.startQueue.push(work)

    clearTimeout(this.stopTimeoutId)
    const timeout: PromiseLike<void> = new Promise((_, reject) => {
      this.stopTimeoutId = setTimeout(reject, 10 * 1000)
    })

    return Promise.race([this.ready.promise, timeout])
    .then(this.search)
    .catch(() => {
      this.reset().then(this.search)
    })
  }

  /*
   * Sends 'stop' command to stockfish if not already stopped
   */
  public stop = (): void => {
    if (!this.stopped) {
      this.stopped = true
      this.stockfish.send('stop')
    }
  }

  public isSearching(): boolean {
    return this.ready.state === 'pending'
  }

  public exit = (): Promise<void> => {
    window.removeEventListener('stockfish', this.listener, false)
    return this.stockfish.exit()
  }

  private reset = (): Promise<void> => {
    return this.exit().then(this.init)
  }

  /*
   * Actual search is launched here, according to work opts, using the last work
   * queued
   */
  private search = async () => {
    const work = this.startQueue.pop()
    if (work) {
      this.work = work
      this.curEval = undefined
      this.expectedPvs = 1
      this.stopped = false
      this.startQueue = []
      this.ready = defer()

      await this.stockfish.setOption('MultiPV', work.multiPv)
      await this.stockfish.send(['position', 'fen', work.initialFen, 'moves'].concat(work.moves).join(' '))
      if (work.maxDepth >= 99) {
        await this.stockfish.send('go depth 99')
      } else {
        await this.stockfish.send('go movetime 90000 depth ' + work.maxDepth)
      }
    }
  }

  /*
   * Stockfish output processing done here
   * Calls the 'resolve' function of the 'ready' Promise when 'bestmove' uci
   * command is sent by stockfish
   */
  private processOutput(text: string) {
    console.debug('[stockfish >>] ' + text)

    const evalMatch = /^info string (classical|NNUE) evaluation/.exec(text)
    if (evalMatch) {
      this.evaluation = evalMatch[1]
    }

    if (text.indexOf('bestmove') === 0) {
      this.ready.resolve()
      this.work?.emit()
    }
    if (this.stopped || this.work === undefined) return

    const matches = EVAL_REGEX.exec(text)
    if (!matches) return

    const depth = parseInt(matches[1]),
      multiPv = parseInt(matches[2]),
      isMate = matches[3] === 'mate',
      povEv = parseInt(matches[4]),
      evalType = matches[5],
      nodes = parseInt(matches[6]),
      elapsedMs: number = parseInt(matches[7]),
      moves = matches[8].split(' ')

    // Sometimes we get #0. Let's just skip it.
    if (isMate && !povEv) return

    // Track max pv index to determine when pv prints are done.
    if (this.expectedPvs < multiPv) this.expectedPvs = multiPv

    const pivot = this.work.threatMode ? 0 : 1
    const ev = (this.work.ply % 2 === pivot) ? -povEv : povEv

    // For now, ignore most upperbound/lowerbound messages.
    // The exception is for multiPV, sometimes non-primary PVs
    // only have an upperbound.
    // See: https://github.com/ddugovic/Stockfish/issues/228
    if (evalType && multiPv === 1) return

    const pvData = {
      moves,
      cp: isMate ? undefined : ev,
      mate: isMate ? ev : undefined,
      depth
    }

    if (multiPv === 1) {
      this.curEval = {
        fen: this.work.currentFen,
        maxDepth: this.work.maxDepth,
        depth,
        knps: nodes / elapsedMs,
        nodes,
        cp: pvData.cp,
        mate: pvData.mate,
        pvs: [pvData],
        millis: elapsedMs,
      }
    } else if (this.curEval) {
      this.curEval.pvs.push(pvData)
      this.curEval.depth = Math.min(this.curEval.depth, depth)
    }

    if (multiPv === this.expectedPvs && this.curEval) {
      this.work.emit(this.curEval)
    }
  }

  private listener = (e: Event) => {
    this.processOutput((e as any).output)
  }
}
