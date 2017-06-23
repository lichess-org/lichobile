import * as stream from 'mithril/stream'
import redraw from '../../../utils/redraw'
import * as debounce from 'lodash/debounce'
import router from '../../../router'
import explorerConfig from './explorerConfig'
import { openingXhr, tablebaseXhr } from './explorerXhr'
import { isSynthetic } from '../util'
import * as gameApi from '../../../lichess/game'
import { ExplorerCtrlInterface, ExplorerData } from '../interfaces'
import AnalyseCtrl from '../AnalyseCtrl'

function tablebaseRelevant(fen: string) {
  const parts = fen.split(/\s/)
  const pieceCount = parts[0].split(/[nbrqkp]/i).length - 1
  return pieceCount <= 7
}

export default function(root: AnalyseCtrl, allow: boolean): ExplorerCtrlInterface {

  const allowed = stream(allow)
  const enabled = stream(false)
  const loading = stream(true)
  const failing = stream(false)
  const current: Mithril.Stream<ExplorerData> = stream({
    moves: []
  })

  function open() {
    router.backbutton.stack.push(close)
    enabled(true)
  }

  function close(fromBB?: string) {
    if (fromBB !== 'backbutton' && enabled()) router.backbutton.stack.pop()
    enabled(false)
    setTimeout(() => root && root.debouncedScroll(), 200)
  }

  let cache: {[index: string]: ExplorerData} = {}

  function setResult(fen: string, data: ExplorerData) {
    cache[fen] = data
    current(data)
  }

  function onConfigClose(changed: boolean) {
    if (changed) {
      cache = {}
      setStep()
    }
  }

  const withGames = !!(isSynthetic(root.data) || gameApi.replayable(root.data) || root.data.game.offline)
  const effectiveVariant: VariantKey = root.data.game.variant.key === 'fromPosition' ? 'standard' : root.data.game.variant.key

  const config = explorerConfig.controller(root.data.game.variant, onConfigClose)
  const debouncedScroll = debounce(() => {
    const table = document.getElementById('explorerTable')
    if (table) table.scrollTop = 0
  }, 200)

  function handleFetchError() {
    loading(false)
    failing(true)
    redraw()
  }

  const fetchOpening = debounce((fen: string): Promise<void> => {
    return openingXhr(effectiveVariant, fen, config.data, withGames)
    .then((res: ExplorerData) => {
      res.opening = true
      res.fen = fen
      setResult(fen, res)
      loading(false)
      failing(false)
      redraw()
    })
    .catch(handleFetchError)
  }, 1000)

  const fetchTablebase = debounce((fen: string): Promise<void> => {
    return tablebaseXhr(effectiveVariant, fen)
    .then((res: ExplorerData) => {
      res.tablebase = true
      res.fen = fen
      setResult(fen, res)
      loading(false)
      failing(false)
      redraw()
    })
    .catch(handleFetchError)
  }, 500)

  function fetch(fen: string) {
    const hasTablebase = ['standard', 'chess960', 'atomic', 'antichess'].includes(effectiveVariant)
    if (hasTablebase && withGames && tablebaseRelevant(fen)) return fetchTablebase(fen)
    else return fetchOpening(fen)
  }

  const empty: ExplorerData = {
    opening: true,
    moves: []
  }

  function setStep() {
    if (!enabled()) return
    const node = root.node
    if (node.ply > 50 && !tablebaseRelevant(node.fen)) {
      setResult(node.fen, empty)
    }
    const fromCache = cache[node.fen]
    if (!fromCache) {
      loading(true)
      fetch(node.fen)
    } else {
      current(fromCache)
      loading(false)
      failing(false)
    }
    redraw()
    debouncedScroll()
  }

  return {
    allowed,
    enabled,
    setStep,
    loading,
    failing,
    config,
    withGames,
    current,
    toggle() {
      if (enabled()) close()
      else open()
      setStep()
    }
  }
}
