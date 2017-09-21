import * as Signal from 'signals'

import { Tree } from '../../shared/tree/interfaces'
import { Work } from './interfaces'
import { setOption, setVariant } from '../../../utils/stockfish'

interface Opts {
  minDepth: number
  maxDepth: number
  multiPv: number
  cores: number
}

const output = new Signal()

const EVAL_REGEX = new RegExp(''
  + /^info depth (\d+) seldepth \d+ multipv (\d+) /.source
  + /score (cp|mate) ([-\d]+) /.source
  + /(?:(upper|lower)bound )?nodes (\d+) nps \S+ /.source
  + /(?:hashfull \d+ )?tbhits \d+ time (\S+) /.source
  + /pv (.+)/.source)

export default function cevalEngine(opts: Opts) {

  let curEval: Tree.ClientEval | null = null
  let expectedPvs = 1

  // after a 'go' command, stockfish will be continue to emit until the 'bestmove'
  // message, reached by depth or after a 'stop' command
  // finished here means stockfish has emited the bestmove and is ready for
  // another command
  let finished = true

  // stopped flag is true when a search has been interrupted before its end
  let stopped = false

  // we may have several start requests queued while we wait for previous
  // eval to complete
  let startQueue: Array<Work> = []

  function processOutput(text: string, work: Work) {
    if (text.indexOf('bestmove') === 0) {
      console.info('stockfish analysis done', text)
      finished = true
    }
    if (stopped) return
    // console.log(text)

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

    // Track max pv index to determine when pv prints are done.
    if (expectedPvs < multiPv) expectedPvs = multiPv

    if (depth < opts.minDepth) return

    let pivot = work.threatMode ? 0 : 1
    if (work.ply % 2 === pivot) ev = -ev

    // For now, ignore most upperbound/lowerbound messages.
    // The exception is for multiPV, sometimes non-primary PVs
    // only have an upperbound.
    // See: https://github.com/ddugovic/Stockfish/issues/228
    if (evalType && multiPv === 1) return

    let pvData = {
      moves,
      cp: isMate ? undefined : ev,
      mate: isMate ? ev : undefined,
      depth
    }

    if (multiPv === 1) {
      curEval = {
        fen: work.currentFen,
        maxDepth: work.maxDepth,
        depth,
        knps: nodes / elapsedMs,
        nodes,
        cp: isMate ? undefined : ev,
        mate: isMate ? ev : undefined,
        pvs: [pvData],
        millis: elapsedMs
      }
    } else if (curEval) {
      curEval.pvs.push(pvData)
      curEval.depth = Math.min(curEval.depth, depth)
    }

    if (multiPv === expectedPvs && curEval) {
      work.emit(curEval)
    }
  }

  function stop(): Promise<{}> {
    return new Promise((resolve) => {
      if (finished) {
        stopped = true
        resolve()
      } else {
        function listen(msg: string) {
          if (msg.indexOf('bestmove') === 0) {
            output.remove(listen)
            finished = true
            resolve()
          }
        }
        output.add(listen)
        if (!stopped) {
          stopped = true
          send('stop')
        }
      }
    })
  }

  function launchEval(work: Work) {

    output.removeAll()
    output.add((msg: string) => processOutput(msg, work))

    stopped = false
    finished = false

    return setOption('Threads', opts.cores)
    .then(() => setOption('MultiPV', work.multiPv))
    .then(() => send(['position', 'fen', work.initialFen, 'moves'].concat(work.moves).join(' ')))
    .then(() => send('go depth ' + opts.maxDepth))
  }

  // take the last work in queue and clear the queue just after
  // to ensure we send to stockfish only one position to evaluate at a time
  function doStart() {
    const work = startQueue.pop()
    if (work) {
      startQueue = []
      launchEval(work)
    }
  }

  return {
    init(variant: VariantKey) {
      return Stockfish.init()
      .then(() => init(variant))
      // stockfish plugin will reject if already inited
      .catch(() => {
        return Stockfish.exit()
        .then(() => Stockfish.init(), () => Stockfish.init())
        .then(() => init(variant))
      })
      .catch(err => console.error('stockfish init error', err))
    },

    start(work: Work) {
      startQueue.push(work)
      stop().then(doStart)
    },

    stop,

    exit() {
      output.removeAll()
      finished = true
      stopped = false
      return Stockfish.exit()
    }
  }
}

function init(variant: VariantKey) {
  Stockfish.output(output.dispatch)
  return send('uci')
  .then(() => setOption('Ponder', 'false'))
  .then(() => setVariant(variant))
}

function send(text: string) {
  console.info('stockfish send', text)
  return Stockfish.cmd(text)
}
