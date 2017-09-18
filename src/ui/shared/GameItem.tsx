import { batchRequestAnimationFrame } from '../../utils/batchRAF'
import * as utils from '../../utils'
import * as playerApi from '../../lichess/player'
import * as gameApi from '../../lichess/game'
import gameStatus from '../../lichess/status'
import { UserGamePlayer, UserGameWithDate } from '../../lichess/interfaces/user'
import session from '../../session'
import i18n from '../../i18n'
import * as helper from '../helper'
import { makeBoard } from './svgboard'

interface Attrs {
  g: UserGameWithDate
  index: number
  boardTheme: string
  userId?: string
}

const GameItem: Mithril.Component<Attrs, {}> = {
  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    return attrs.g !== oldattrs.g
  },
  view({ attrs }) {
    const { g, index, userId, boardTheme } = attrs
    const time = gameApi.time(g)
    const mode = g.rated ? i18n('rated') : i18n('casual')
    const title = g.source === 'import' ?
    `Import • ${g.variant.name}` :
    `${time} • ${g.variant.name} • ${mode}`
    const status = gameStatus.toLabel(g.status.name, g.winner, g.variant.key) +
      (g.winner ? '. ' + i18n(g.winner === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '')
    const icon = g.source === 'import' ? '/' : utils.gameIcon(g.perf) || ''
    const perspectiveColor: Color = userId ? g.players.white.userId === userId ? 'white' : 'black' : 'white'
    const evenOrOdd = index % 2 === 0 ? 'even' : 'odd'
    const star = g.bookmarked ? 't' : 's'
    const withStar = session.isConnected() ? ' withStar' : ''

    return (
      <li data-id={g.id} className={`userGame ${evenOrOdd}${withStar}`}>
        {renderBoard(g.fen, perspectiveColor, boardTheme)}
        <div className="userGame-infos">
          <div className="userGame-versus">
            <span className="variant-icon" data-icon={icon} />
            <div className="game-result">
              <div className="userGame-players">
                {renderPlayer(g.players, 'white')}
                <div className="swords" data-icon="U" />
                {renderPlayer(g.players, 'black')}
              </div>
              <div className={helper.classSet({
                'userGame-status': true,
                win: !!(g.winner && perspectiveColor === g.winner),
                loose: !!(g.winner && perspectiveColor !== g.winner)
              })}>
                {status}
              </div>
            </div>
          </div>
          <div className="userGame-meta">
            <p className="game-infos">
            {g.date} • {title}
            </p>
            {g.opening ?
              <p className="opening">{g.opening.name}</p> : null
            }
            {g.analysed ?
              <p className="analysis">
              <span className="fa fa-bar-chart" />
              Computer analysis available
              </p> : null
            }
          </div>
        </div>
        { session.isConnected() ?
          <button className="iconStar" data-icon={star} /> : null
        }
      </li>
    )
  }
}

export default GameItem

function renderBoard(fen: string, orientation: Color, boardTheme: string) {

  const boardClass = [
    'display_board',
    boardTheme
  ].join(' ')

  return (
    <div className={boardClass} key={fen}
      oncreate={({ dom }: Mithril.DOMNode) => {
        const img = document.createElement('img')
        img.className = 'cg-board'
        img.src = 'data:image/svg+xml;utf8,' + makeBoard(fen, orientation)
        batchRequestAnimationFrame(() => {
          const placeholder = dom.firstChild
          if (placeholder) dom.replaceChild(img, placeholder)
        })
      }}
    >
      <div className="cg-board" />
    </div>
  )
}

function renderPlayer(players: { white: UserGamePlayer, black: UserGamePlayer}, color: Color) {
  let player = players[color]
  let playerName: string
  // TODO fetch title info from server; refactor
  if (player.userId) playerName = player.userId
  else if (!player.aiLevel) playerName = playerApi.playerName(player)
  else if (player.aiLevel) {
    playerName = playerApi.aiName({ ai: player.aiLevel })
  }
  else playerName = 'Anonymous'

  return (
    <div className={'player ' + color}>
      <span className="playerName">{playerName}</span>
      <br/>
      {player.rating ?
      <small className="playerRating">{player.rating}</small> : null
      }
      {player.ratingDiff ?
        helper.renderRatingDiff(player) : null
      }
    </div>
  )
}
