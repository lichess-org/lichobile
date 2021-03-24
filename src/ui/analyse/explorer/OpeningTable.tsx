import h from 'mithril/hyperscript'
import i18n from '../../../i18n'
import router from '../../../router'
import * as helper from '../../helper'
import { OnlineGameData } from '../../../lichess/interfaces/game'
import { OpeningData, Game, OpeningMoveStats, Player } from './interfaces'
import AnalyseCtrl from '../AnalyseCtrl'
import settings from '../../../settings'
import * as xhr from '../../../xhr'

let pieceNotation: boolean

export interface Attrs {
  ctrl: AnalyseCtrl
  data: OpeningData
}

const OpeningTable: Mithril.Component<Attrs> = {
  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    return attrs.data !== oldattrs.data
  },

  view({ attrs }) {
    const { ctrl, data } = attrs

    const moveTable = showMoveTable(ctrl, data.moves)
    const recentTable = showGameTable(ctrl, i18n('recentGames'), data.recentGames || [])
    const topTable = showGameTable(ctrl, i18n('topGames'), data.topGames || [])

    if (moveTable || recentTable || topTable) {
      return (
        <div className="explorer-data">
          {moveTable}
          {topTable}
          {recentTable}
        </div>
      )
    } else {
      return showEmpty(ctrl)
    }
  }
}

export default OpeningTable

export function showEmpty(ctrl: AnalyseCtrl) {
  return (
    <div className="explorer-data empty">
      <div className="message">
        <h3>
          <i className="withIcon" data-icon="" />
          {i18n('noGameFound')}
        </h3>
        { !ctrl.explorer.config.fullHouse() ?
        <p>{i18n('maybeIncludeMoreGamesFromThePreferencesMenu')}</p> : null
        }
      </div>
    </div>
  )
}

export function getTR(e: Event): HTMLElement | null {
  const target = (e.target as HTMLElement)
  return target.tagName === 'TR' ? target : target.closest('tr')
}

function resultBar(move: OpeningMoveStats) {
  const sum = move.white + move.draws + move.black
  function section(key: string) {
    const num: number = (move as any)[key]
    const percent = num * 100 / sum
    const width = (Math.round(num * 1000 / sum) / 10) + '%'
    return percent === 0 ? null : (
      <span className={'explorerBar ' + key} style={{width}}>
        {percent > 12 ? Math.round(percent) + (percent > 20 ? '%' : '') : null}
      </span>
    )
  }
  return ['white', 'draws', 'black'].map(section)
}

function onTableTap(ctrl: AnalyseCtrl, e: Event) {
  const el = getTR(e)
  const uci = el && el.dataset['uci']
  if (uci) ctrl.playUci(uci)
}

function showResult(w: Color) {
  if (w === 'white') return <result className="white">1-0</result>
  if (w === 'black') return <result className="black">0-1</result>
  return <result className="draws">½-½</result>
}

function link(ctrl: AnalyseCtrl, e: Event) {
  const orientation = ctrl.chessground.state.orientation
  const el = getTR(e)
  const gameId = el && el.dataset['id']
  if (gameId && ctrl.explorer.config.data.db.selected() === 'lichess') {
    router.set(`/analyse/online/${gameId}/${orientation}`)
  } else if (gameId) {
    xhr.importMasterGame(gameId, orientation)
    .then((data: OnlineGameData) =>
      router.set(`/analyse/online/${data.game.id}/${orientation}`)
    )
  }
}

function showGameTable(ctrl: AnalyseCtrl, title: string, games: readonly Game[]) {
  if (!ctrl.explorer.withGames || !games.length) return null
  return (
    <table className="games"
      oncreate={helper.ontapXY(e => link(ctrl, e!), undefined, getTR)}
    >
      <thead>
        <tr>
          <th colspan="4">{title}</th>
        </tr>
      </thead>
      <tbody>
      { games.map((game: Game) => {
        return (
          <tr key={game.id} data-id={game.id}>
            <td>
              {[game.white, game.black].map((p: Player) =>
                <span>{p.rating}</span>
              )}
            </td>
            <td>
              {[game.white, game.black].map((p: Player) =>
                <span>{p.name}</span>
              )}
            </td>
            <td>
              {showResult(game.winner)}
            </td>
            <td>
              {game.year}
            </td>
          </tr>
        )
      })}
      </tbody>
    </table>
  )
}

function showMoveTable(ctrl: AnalyseCtrl, moves: readonly OpeningMoveStats[]) {
  if (!moves.length) return null
  pieceNotation = pieceNotation === undefined ? settings.game.pieceNotation() : pieceNotation
  return (
    <table className="moves"
      oncreate={helper.ontapXY(e => onTableTap(ctrl, e!), undefined, getTR)}
    >
      <thead>
        <tr>
          <th className="explorerMove-move">{i18n('move')}</th>
          <th className="explorerMove-games">{i18n('games')}</th>
          <th className="explorerMove-result">{i18n('whiteDrawBlack')}</th>
        </tr>
      </thead>
      <tbody className={pieceNotation ? 'displayPieces' : ''}>
        { moves.map(move => {
          return (
            <tr key={move.uci} data-uci={move.uci}>
              <td className="explorerMove-move">
                {move.san[0] === 'P' ? move.san.slice(1) : move.san}
              </td>
              <td className="explorerMove-games">
                {move.white + move.draws + move.black}
              </td>
              <td className="explorerMove-result">
                {resultBar(move)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
