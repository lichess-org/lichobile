import * as stream from 'mithril/stream'
import redraw from '../../../utils/redraw'
import * as debounce from 'lodash/debounce'
import explorerConfig from './explorerConfig'
import { openingXhr, tablebaseXhr } from './explorerXhr'
import { isSynthetic } from '../util'
import * as gameApi from '../../../lichess/game'
import { IExplorerCtrl, ExplorerData } from './interfaces'
import AnalyseCtrl from '../AnalyseCtrl'

export default function ExplorerCtrl(
  root: AnalyseCtrl
): IExplorerCtrl {

  const loading = stream(true)
  const failing = stream(false)
  const current: Mithril.Stream<ExplorerData> = stream({
    moves: []
  })

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
    const conf = {
      db: config.data.db.selected(),
      speeds: config.data.speed.selected(),
      ratings: config.data.rating.selected()
    }
    return openingXhr(effectiveVariant, fen, conf, withGames)
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
    if (root.currentTab(root.availableTabs()).id !== 'explorer') return
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
    setStep,
    loading,
    failing,
    config,
    withGames,
    current,
    fetchMasterOpening: (function() {
      const masterCache: {[fen: string]: ExplorerData } = {}
      return function(fen: string) {
        if (masterCache[fen]) return Promise.resolve(masterCache[fen])
        return openingXhr('standard', fen, { db: 'masters' }, false)
        .then((res) => {
          masterCache[fen] = res
          return res
        })
      }
    })()
  }
}

function tablebaseRelevant(fen: string) {
  const parts = fen.split(/\s/)
  const pieceCount = parts[0].split(/[nbrqkp]/i).length - 1
  return pieceCount <= 7
}
