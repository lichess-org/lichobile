import debounce from 'lodash-es/debounce'
import redraw from '../../../utils/redraw'
import { oppositeColor, prop } from '../../../utils'
import { colorOf } from '../../../utils/fen'
import * as gameApi from '../../../lichess/game'
import { isSynthetic } from '../util'
import AnalyseCtrl from '../AnalyseCtrl'
import explorerConfig from './explorerConfig'
import { openingXhr, tablebaseXhr } from './explorerXhr'
import { IExplorerCtrl, ExplorerData, OpeningData, SimpleTablebaseHit, TablebaseData, TablebaseMoveStats } from './interfaces'

export default function ExplorerCtrl(
  root: AnalyseCtrl,
  allowed: boolean
): IExplorerCtrl {

  const loading = prop(true)
  const failing = prop(false)
  const current = prop<ExplorerData>({
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
    .then((res: OpeningData) => {
      res.isOpening = true
      res.fen = fen
      setResult(fen, res)
      loading(false)
      failing(false)
      redraw()
    })
    .catch(handleFetchError)
  }, 1000, { leading: true, trailing: true })

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
  }, 500, { leading: true, trailing: true })

  function fetch(fen: string) {
    if (withGames && tablebaseRelevant(effectiveVariant, fen)) return fetchTablebase(fen)
    else return fetchOpening(fen)
  }

  const empty: ExplorerData = {
    isOpening: true,
    moves: []
  }

  function setStep() {
    if (root.currentTab(root.availableTabs()).id !== 'explorer') return
    const node = root.node
    if (node.ply > 50 && !tablebaseRelevant(effectiveVariant, node.fen)) {
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
    setStep,
    loading,
    failing,
    config,
    withGames,
    current,
    fetchMasterOpening: (function() {
      const masterCache: {[fen: string]: OpeningData } = {}
      return function(fen: string): Promise<OpeningData> {
        if (masterCache[fen]) return Promise.resolve(masterCache[fen])
        return openingXhr('standard', fen, { db: 'masters' }, false)
        .then((res) => {
          masterCache[fen] = res
          return res
        })
      }
    })(),
    fetchTablebaseHit(fen: string): Promise<SimpleTablebaseHit> {
      return tablebaseXhr(effectiveVariant, fen, 2000).then((res: TablebaseData) => {
        const move = res.moves[0]
        if (move && move.dtz == null) throw 'unknown tablebase position'
        return {
          fen: fen,
          best: move && move.uci,
          winner: res.checkmate ? oppositeColor(colorOf(fen)) : (
            res.stalemate ? undefined : winnerOf(fen, move!)
          )
        } as SimpleTablebaseHit
      })
    }
  }
}

function tablebaseRelevant(variant: VariantKey, fen: string) {
  const parts = fen.split(/\s/)
  const pieceCount = parts[0].split(/[nbrqkp]/i).length - 1

  if (variant === 'standard' || variant === 'chess960') return pieceCount <= 8
  else if (variant === 'atomic' || variant === 'antichess') return pieceCount <= 7
  else return false
}

export function winnerOf(fen: Fen, move: TablebaseMoveStats): Color | undefined {
  const stm = fen.split(' ')[1]
  if ((stm[0] === 'w' && move.wdl! < 0) || (stm[0] === 'b' && move.wdl! > 0))
    return 'white'
  if ((stm[0] === 'b' && move.wdl! < 0) || (stm[0] === 'w' && move.wdl! > 0))
    return 'black'
}
