import * as h from 'mithril/hyperscript'
import * as helper from '../../helper'
import explorerConfig from './explorerConfig'
import { Move, isTablebaseData } from './interfaces'
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
    <div id="explorerTable" className={className} key="explorer">
      { data && data.opening ?
      <div className="explorer-fixedTitle">
        { opening ? opening.eco + ' ' + opening.name : '' }
      </div> : null
      }
      { loading ? <div key="loader" className="spinner_overlay">
        <div className="spinner fa fa-hourglass-half" />
      </div> : null
      }
      { configOpened ? showConfig(ctrl) : null }
      { !configOpened && ctrl.explorer.failing() ? failing() : null }
      { !configOpened && !ctrl.explorer.failing() ? show(ctrl) : null }
      { configOpened || (data && data.opening) ?
        <span key={configOpened ? 'config-onpen' : 'config-close'} className="toconf" data-icon={configOpened ? 'L' : '%'}
          oncreate={helper.ontap(config.toggleOpen)}
        /> : null
      }
    </div>
  )
}

export function getTitle(ctrl: AnalyseCtrl): Mithril.Children {
  const data = ctrl.explorer.current()
  if (ctrl.data.game.variant.key === 'standard' || ctrl.data.game.variant.key === 'fromPosition') {
    if (data && data.tablebase) return 'Endgame tablebase'
    else return 'Opening explorer'
  } else {
    const what = data && data.tablebase ? ' endgame tablebase' :  ' opening explorer'
    return ctrl.data.game.variant.name + what
  }
}


function onTablebaseTap(ctrl: AnalyseCtrl, e: Event) {
  const el = getTR(e)
  const uci = el && el.dataset['uci']
  if (uci) ctrl.uciMove(uci)
}

function showTablebase(ctrl: AnalyseCtrl, title: string, moves: Array<Move>, fen: string) {
  let stm = fen.split(/\s/)[1]
  if (!moves.length) return null
  return [
    <div className="title">{title}</div>,
    <table className="explorerTablebase"
      oncreate={helper.ontapXY(e => onTablebaseTap(ctrl, e!), undefined, getTR)}
    >
      <tbody>
      {moves.map((move: Move) => {
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

function winner(stm: string, move: Move) {
  if ((stm[0] === 'w' && move.wdl < 0) || (stm[0] === 'b' && move.wdl > 0))
    return 'white'
  else if ((stm[0] === 'b' && move.wdl < 0) || (stm[0] === 'w' && move.wdl > 0))
    return 'black'
  else
    return null
}

function showDtm(stm: string, move: Move) {
  if (move.dtm) return h('result.' + winner(stm, move), {
    title: 'Mate in ' + Math.abs(move.dtm) + ' half-moves (Depth To Mate)'
  }, 'DTM ' + Math.abs(move.dtm))
  else return null
}

function showDtz(stm: string, move: Move) {
  if (move.checkmate) return h('result.' + winner(stm, move), 'Checkmate')
  else if (move.stalemate) return h('result.draws', 'Stalemate')
  else if (move.variant_win) return h('result.' + winner(stm, move), 'Variant loss')
  else if (move.variant_loss) return h('result.' + winner(stm, move), 'Variant win')
  else if (move.insufficient_material) return h('result.draws', 'Insufficient material')
  else if (move.dtz === null) return null
  else if (move.dtz === 0) return h('result.draws', 'Draw')
  else if (move.zeroing) {
    let capture = move.san.indexOf('x') !== -1
    if (capture) return h('result.' + winner(stm, move), 'Capture')
    else return h('result.' + winner(stm, move), 'Pawn move')
  }
  else return h('result.' + winner(stm, move), {
    title: 'Next capture or pawn move in ' + Math.abs(move.dtz) + ' half-moves (Distance To Zeroing of the 50 move counter)'
  }, 'DTZ ' + Math.abs(move.dtz))
}

function showGameEnd(title: string) {
  return h('div.explorer-data.empty', {
    key: 'explorer-game-end' + title
  }, [
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
  if (data && data.opening) {
    return h(OpeningTable, { data, ctrl })
  }
  else if (data && isTablebaseData(data)) {
    const moves = data.moves
    if (moves.length) {
      return (
        <div key="explorer-tablebase" className="explorer-data">
          {showTablebase(ctrl, 'Winning', moves.filter((move: Move) => move.wdl === -2), data.fen)}
          {showTablebase(ctrl, 'Unknown', moves.filter((move: Move) => move.wdl === null), data.fen)}
          {showTablebase(ctrl, 'Win prevented by 50-move rule', moves.filter((move: Move) => move.wdl === -1), data.fen)}
          {showTablebase(ctrl, 'Drawn', moves.filter((move: Move) => move.wdl === 0), data.fen)}
          {showTablebase(ctrl, 'Loss saved by 50-move rule', moves.filter((move: Move) => move.wdl === 1), data.fen)}
          {showTablebase(ctrl, 'Losing', moves.filter((move: Move) => move.wdl === 2), data.fen)}
        </div>
      )
    }
    else if (data.checkmate) return showGameEnd('Checkmate')
    else if (data.stalemate) return showGameEnd('Stalemate')
    else if (data.variant_win || data.variant_loss) return showGameEnd('Variant end')
    else return showEmpty(ctrl)
  }
  return <div key="explorer-no-data" />
}

function showConfig(ctrl: AnalyseCtrl) {
  return h('div.explorerConfig', {
    key: 'opening-config'
  }, explorerConfig.view(ctrl.explorer.config))
}

function failing() {
  return h('div.explorer-data.empty', {
    key: 'failing'
  }, h('div.failing.message', [
    h('h3', [
      h('i.withIcon[data-icon=,]'),
      'Oops, sorry!'
    ]),
    h('p', 'The explorer is temporarily'),
    h('p', 'out of service. Try again soon!')
  ]))
}

