import { Tree } from '../../shared/tree/interfaces'
import { Work, IEngine } from './interfaces'
import { Stockfish } from '../../../stockfish'

const EVAL_REGEX = new RegExp(''
  + /^info depth (\d+) seldepth \d+ multipv (\d+) /.source
  + /score (cp|mate) ([-\d]+) /.source
  + /(?:(upper|lower)bound )?nodes (\d+) nps \S+ /.source
  + /(?:hashfull \d+ )?(?:tbhits \d+ )?time (\S+) /.source
  + /pv (.+)/.source)

export default function StockfishEngine(variant: VariantKey): IEngine {
  const stockfish = new Stockfish(variant)

  let stopTimeoutId: number
  let readyPromise: Promise<void> = Promise.resolve()

  let curEval: Tree.ClientEval | null = null

  // after a 'go' command, stockfish will be continue to emit until the 'bestmove'
  // message, reached by depth or after a 'stop' command
  // finished here means stockfish has emited 'bestmove' and is ready for
  // another command
  let finished = true

  // stopped flag is true when a search has been interrupted before its end
  let stopped = false

  // we may have several start requests queued while we wait for previous
  // eval to complete
  let startQueue: Array<Work> = []

  /*
   * Init engine with default options and variant
   */
  function init() {
    return stockfish.plugin.start()
    .then(() => stockfish.send('uci'))
    .then(() => stockfish.setOption('Ponder', 'false'))
    .then(() => stockfish.setVariant())
    .catch((err: any) => console.error('stockfish init error', err))
  }

  /*
   * Stop current command if not already stopped, then add a search command to
   * the queue.
   * The search will start when stockfish is ready (after reinit if it takes more
   * than 5s to stop current search)
   */
  function start(work: Work) {
    stop()
    startQueue.push(work)

    clearTimeout(stopTimeoutId)
    const timeout: PromiseLike<void> = new Promise((_, reject) => {
      stopTimeoutId = setTimeout(reject, 5 * 1000)
    })

    return Promise.race([readyPromise, timeout])
    .then(search)
    .catch(() => {
      reset().then(search)
    })
  }

  /*
   * Sends 'stop' command to stockfish if not already stopped
   */
  function stop() {
    if (!stopped) {
      stopped = true
      stockfish.send('stop')
    }
  }

  /*
   * Actual search is launched here, according to work opts, using the last work
   * queued
   */
  function search() {
    const work = startQueue.pop()
    if (work) {
      stopped = false
      finished = false
      startQueue = []
      curEval = null

      readyPromise = new Promise((resolve) => {
        stockfish.plugin.removeAllListeners()
        stockfish.addListener(line => {
          processOutput(line, work, resolve)
        })
      })

      return stockfish.setOption('Threads', work.cores)
      .then(() => stockfish.setOption('Hash', work.hash))
      .then(() => stockfish.setOption('MultiPV', work.multiPv))
      .then(() => stockfish.send(['position', 'fen', work.initialFen, 'moves'].concat(work.moves).join(' ')))
      .then(() => stockfish.send('go depth ' + work.maxDepth))
    }
  }

  /*
   * Stockfish output processing done here
   * Calls the 'resolve' function of the 'ready' Promise when 'bestmove' uci
   * command is sent by stockfish
   */
  function processOutput(text: string, work: Work, rdyResolve: () => void) {
    if (text.indexOf('bestmove') === 0) {
      finished = true
      rdyResolve()
      work.emit()
    }
    if (finished || stopped) return

    const matches = text.match(EVAL_REGEX)
    if (!matches) return

    const depth = parseInt(matches[1]),
      multiPv = parseInt(matches[2]),
      isMate = matches[3] === 'mate',
      evalType = matches[5],
      nodes = parseInt(matches[6]),
      elapsedMs: number = parseInt(matches[7]),
      moves = matches[8].split(' ')

    let ev = parseInt(matches[4])

    // Sometimes we get #0. Let's just skip it.
    if (isMate && !ev) return

    const pivot = work.threatMode ? 0 : 1
    if (work.ply % 2 === pivot) ev = -ev

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

    const knps = nodes / elapsedMs

    if (curEval == null) {
      curEval = {
        fen: work.currentFen,
        maxDepth: work.maxDepth,
        depth,
        knps,
        nodes,
        cp: pvData.cp,
        mate: pvData.mate,
        pvs: [pvData],
        millis: elapsedMs
      }
    } else {
      curEval.depth = depth
      curEval.knps = knps
      curEval.nodes = nodes
      curEval.cp = pvData.cp
      curEval.mate = pvData.mate
      curEval.millis = elapsedMs
      const multiPvIdx = multiPv - 1
      if (curEval.pvs.length > multiPvIdx) {
        curEval.pvs[multiPvIdx] = pvData
      } else {
        curEval.pvs.push(pvData)
      }
    }

    work.emit(curEval)
  }


  function exit() {
    stockfish.plugin.removeAllListeners()
    return stockfish.plugin.exit()
  }

  function reset() {
    return exit().then(init)
  }

  return {
    init,
    start,
    stop,
    exit,
    isSearching() {
      return !finished
    }
  }
}
