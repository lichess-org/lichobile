import * as Mithril from 'mithril'
import h from 'mithril/hyperscript'
import i18n, { plural } from '../../../i18n'
import * as helper from '../../helper'
import explorerConfig from './explorerConfig'
import { isTablebaseData, isOpeningData, TablebaseMoveStats } from './interfaces'
import AnalyseCtrl from '../AnalyseCtrl'
import OpeningTable, { showEmpty, getTR } from './OpeningTable'

export default function renderExplorer(ctrl: AnalyseCtrl) {
  const data = ctrl.explorer.current()
  const config = ctrl.explorer.config
  const configOpened = config.open()
  const loading = !configOpened && ctrl.explorer.loading()
  const className = helper.classSet({
    explorerTable: true,
    loading
  })
  const opening = ctrl.tree.getOpening(ctrl.nodeList) || ctrl.data.game.opening
  return (
    <div id="explorerTable" className={className}>
      { data && data.isOpening ?
      <div className="explorer-fixedTitle">
        <span>{ opening ? opening.eco + ' ' + opening.name : '' }</span>
        { configOpened || (data && data.isOpening) ?
          <span className="toconf" data-icon={configOpened ? 'L' : '%'}
            oncreate={helper.ontap(config.toggleOpen)}
          /> : null
        }
      </div> : null
      }
      { loading ? <div className="spinner_overlay">
        <div className="spinner fa fa-hourglass-half" />
      </div> : null
      }
      { configOpened ? showConfig(ctrl) : null }
      { !configOpened && ctrl.explorer.failing() ? failing() : null }
      { !configOpened && !ctrl.explorer.failing() ? show(ctrl) : null }
    </div>
  )
}

export function getTitle(ctrl: AnalyseCtrl): Mithril.Children {
  if (ctrl.data.game.variant.key === 'standard' || ctrl.data.game.variant.key === 'fromPosition') {
    return i18n('openingExplorer')
  } else {
    return i18n('xOpeningExplorer', ctrl.data.game.variant.name)
  }
}


function onTablebaseTap(ctrl: AnalyseCtrl, e: Event) {
  const el = getTR(e)
  const uci = el && el.dataset['uci']
  if (uci) ctrl.playUci(uci)
}

function showTablebase(ctrl: AnalyseCtrl, title: string, moves: readonly TablebaseMoveStats[], fen: string) {
  let stm = fen.split(/\s/)[1]
  if (!moves.length) return null
  return [
    <div className="title">{title}</div>,
    <table className="explorerTablebase"
      oncreate={helper.ontapXY(e => onTablebaseTap(ctrl, e!), undefined, getTR)}
    >
      <tbody>
      {moves.map((move: TablebaseMoveStats) => {
        return <tr data-uci={move.uci} key={move.uci}>
          <td>{move.san}</td>
          <td>
            {showDtz(stm, move)}
            {showDtm(stm, move)}
          </td>
        </tr>
      })}
      </tbody>
    </table>
  ]
}

function winner(stm: string, move: TablebaseMoveStats) {
  if ((stm[0] === 'w' && Number(move.wdl) < 0) || (stm[0] === 'b' && Number(move.wdl) > 0))
    return 'white'
  else if ((stm[0] === 'b' && Number(move.wdl) < 0) || (stm[0] === 'w' && Number(move.wdl) > 0))
    return 'black'
  else
    return null
}

function showDtm(stm: string, move: TablebaseMoveStats) {
  if (move.dtm) return h('result.' + winner(stm, move), {
    title: plural('mateInXHalfMoves', Math.abs(move.dtm)),
  }, 'DTM ' + Math.abs(move.dtm))
  else return null
}

function showDtz(stm: string, move: TablebaseMoveStats) {
  if (move.checkmate) return h('result.' + winner(stm, move), i18n('checkmate'))
  else if (move.stalemate) return h('result.draws', i18n('stalemate'))
  else if (move.variant_win) return h('result.' + winner(stm, move), i18n('variantWin'))
  else if (move.variant_loss) return h('result.' + winner(stm, move), i18n('variantLoss'))
  else if (move.insufficient_material) return h('result.draws', i18n('insufficientMaterial'))
  else if (move.dtz === null) return null
  else if (move.dtz === 0) return h('result.draws', i18n('draw'))
  else if (move.zeroing) {
    let capture = move.san.indexOf('x') !== -1
    if (capture) return h('result.' + winner(stm, move), i18n('capture'))
    else return h('result.' + winner(stm, move), i18n('pawnMove'))
  }
  else return h('result.' + winner(stm, move), {
    title: plural('nextCaptureOrPawnMoveInXHalfMoves', Math.abs(move.dtz))
  }, 'DTZ ' + Math.abs(move.dtz))
}

function showGameEnd(title: string) {
  return h('div.explorer-data.empty', [
    h('div.message', [
      h('h3', [
        h('i.withIcon[data-icon=]'),
        title
      ])
    ])
  ])
}

function show(ctrl: AnalyseCtrl) {
  const data = ctrl.explorer.current()
  if (data && isOpeningData(data)) {
    return h(OpeningTable, { data, ctrl })
  }
  else if (data && isTablebaseData(data)) {
    const moves = data.moves
    if (moves.length) {
      return (
        <div className="explorer-data">
          {showTablebase(ctrl, i18n('winning'), moves.filter((move) => move.wdl === -2), data.fen)}
          {showTablebase(ctrl, i18n('unknown'), moves.filter((move) => move.wdl === null), data.fen)}
          {showTablebase(ctrl, i18n('winPreventedBy50MoveRule'), moves.filter((move) => move.wdl === -1), data.fen)}
          {showTablebase(ctrl, i18n('drawn'), moves.filter((move) => move.wdl === 0), data.fen)}
          {showTablebase(ctrl, i18n('lossSavedBy50MoveRule'), moves.filter((move) => move.wdl === 1), data.fen)}
          {showTablebase(ctrl, i18n('losing'), moves.filter((move) => move.wdl === 2), data.fen)}
        </div>
      )
    }
    else if (data.checkmate) return showGameEnd(i18n('checkmate'))
    else if (data.stalemate) return showGameEnd(i18n('stalemate'))
    else if (data.variant_win || data.variant_loss) return showGameEnd(i18n('variantEnding'))
    else return showEmpty(ctrl)
  }
  return <div />
}

function showConfig(ctrl: AnalyseCtrl) {
  return h('div.explorerConfig', {
  }, explorerConfig.view(ctrl.explorer.config))
}

function failing() {
  return h('div.explorer-data.empty', {
  }, h('div.failing.message', [
    h('h3', [
      h('i.withIcon[data-icon=,]'),
      'Oops, sorry!'
    ]),
    h('p', 'The explorer is temporarily'),
    h('p', 'out of service. Try again soon!')
  ]))
}

