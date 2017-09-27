import settings from '../../../settings'
import StockfishEngine from './StockfishEngine'
import { Tree } from '../../shared/tree'
import { Opts, Work, ICevalCtrl } from './interfaces'

export default function CevalCtrl(
  variant: VariantKey,
  allowed: boolean,
  emit: (work: Work, res?: Tree.ClientEval) => void,
  initOpts: Opts
): ICevalCtrl {

  let initialized = false

  const minDepth = 6
  const maxDepth = 22

  const opts = {
    multiPv: initOpts.multiPv,
    cores: initOpts.cores,
    infinite: initOpts.infinite
  }

  const engine = StockfishEngine()

  let started = false
  let isEnabled = settings.analyse.enableCeval()

  function enabled() {
    return allowed && isEnabled
  }

  function onEmit(work: Work, res?: Tree.ClientEval) {
    emit(work, res)
  }

  function start(path: Tree.Path, nodes: Tree.Node[], forceOneLine: boolean) {
    if (!enabled()) {
      return
    }
    const step = nodes[nodes.length - 1]
    if (step.ceval && step.ceval.depth >= maxDepth) {
      return
    }
    const work = {
      initialFen: nodes[0].fen,
      currentFen: step.fen,
      moves: nodes.slice(1).map((s) => fixCastle(s.uci!, s.san!)),
      maxDepth: effectiveMaxDepth(),
      cores: opts.cores,
      path,
      ply: step.ply,
      multiPv: opts.multiPv,
      forceOneLine,
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
      })
      .catch(() => {
        initialized = false
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
      return engine.init(variant).then(() => {
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
    minDepth,
    variant,
    start,
    stopWhenFinished() {
      if (!enabled() || !started) return
      engine.stopWhenFinished()
      started = false
    },
    stopImmediately() {
      if (!enabled() || !started) return
      engine.stopImmediately()
      started = false
    },
    destroy,
    allowed,
    enabled,
    toggle() {
      isEnabled = settings.analyse.enableCeval()
    },
    setCores(c: number) {
      opts.cores = c
    },
    setMultiPv(pv: number) {
      opts.multiPv = pv
    },
    toggleInfinite() {
      opts.infinite = !opts.infinite
    },
    opts
  }
}
