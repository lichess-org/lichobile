import settings from '../../../settings'
import { Tree } from '../../shared/tree'
import { getMaxMemory, getNbCores } from '../../../stockfish'
import StockfishEngine from './StockfishEngine'
import { Opts, Work, ICevalCtrl } from './interfaces'

export default function CevalCtrl(
  opts: Opts,
  emit: (path: string, res?: Tree.ClientEval) => void,
): ICevalCtrl {

  let initialized = false

  const minDepth = 6
  const maxDepth = 22

  const engine = StockfishEngine(opts.variant)

  let started = false
  let isEnabled = settings.analyse.enableCeval()

  function enabled() {
    return opts.allowed && isEnabled
  }

  function onEmit(work: Work, res?: Tree.ClientEval) {
    emit(work.path, res)
  }

  async function start(path: Tree.Path, nodes: Tree.Node[], forceMaxLevel: boolean) {
    if (!enabled()) {
      return
    }
    const hash = await getMaxMemory()
    const step = nodes[nodes.length - 1]
    if (step.ceval && step.ceval.depth >= maxDepth) {
      return
    }
    const work = {
      initialFen: nodes[0].fen,
      currentFen: step.fen,
      moves: nodes.slice(1).map((s) => fixCastle(s.uci!, s.san!)),
      maxDepth: forceMaxLevel ? 18 : effectiveMaxDepth(),
      cores: forceMaxLevel ? getNbCores() : opts.cores,
      hash,
      path,
      ply: step.ply,
      multiPv: forceMaxLevel ? 1 : opts.multiPv,
      threatMode: false,
      emit(res?: Tree.ClientEval) {
        if (enabled()) onEmit(work, res)
      }
    }

    engine.start(work)
    started = true
  }

  function effectiveMaxDepth() {
    return opts.infinite ? 99 : maxDepth
  }

  function destroy() {
    if (initialized) {
      engine.exit()
      .then(() => {
        initialized = false
        started = false
      })
      .catch(() => {
        initialized = false
        started = false
      })
    }
  }

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

  return {
    init() {
      return engine.init().then(() => {
        initialized = true
      })
    },
    isInit() {
      return initialized
    },
    isSearching() {
      return engine.isSearching()
    },
    maxDepth,
    effectiveMaxDepth,
    minDepth,
    variant: opts.variant,
    start,
    stop() {
      if (!enabled() || !started) return
      engine.stop()
      started = false
    },
    destroy,
    allowed: opts.allowed,
    enabled,
    toggle() {
      isEnabled = !isEnabled
    },
    disable() {
      isEnabled = false
    },
    setCores(c: number) {
      opts.cores = c
    },
    setMultiPv(pv: number) {
      opts.multiPv = pv
    },
    getMultiPv(): number {
      return opts.multiPv
    },
    toggleInfinite() {
      opts.infinite = !opts.infinite
    }
  }
}
