import { throttle } from 'lodash';
import * as h from 'mithril/hyperscript';
import * as utils from '../../../utils';
import { batchRequestAnimationFrame } from '../../../utils/batchRAF'
import router from '../../../router';
import settings from '../../../settings';
import * as helper from '../../helper';
import * as gameApi from '../../../lichess/game';
import i18n from '../../../i18n';
import gameStatus from '../../../lichess/status';
import session from '../../../session';
import spinner from '../../../spinner';
import { makeBoard } from '../../shared/svgboard';
import { UserGameWithDate } from '../userXhr';
import { UserGamePlayer } from '../../../lichess/interfaces/user';

import { State, ScrollState } from './';

interface Bounds {
  width: number
  height: number
}

export function renderBody(ctrl: State) {
  return (
    <div className="userGamesWrapper">
      <div className="select_input select_games_filter">
        <label htmlFor="filterGames"></label>
        <select id="filterGames" onchange={ctrl.onFilterChange}>
          {ctrl.scrollState.availableFilters.map(f => {
            return (
              <option value={f.key} selected={ctrl.scrollState.currentFilter === f.key}>
                {utils.capitalize(i18n(f.label).replace('%s ', ''))} ({f.count})
              </option>
            );
          })}
        </select>
        <div className="main_header_drop_shadow" />
      </div>
      {renderAllGames(ctrl)}
    </div>
  );
}

function getGameEl(e: Event) {
  const target = (e.target as HTMLElement);
  return target.tagName === 'LI' ? target :
    helper.findParentBySelector(target, 'li');
}

function getButton(e: Event) {
  const target = (e.target as HTMLElement);
  return target.tagName === 'BUTTON' ? target : undefined
}

interface GameDataSet extends DOMStringMap {
  id: string
}
function onTap(ctrl: State, e: Event) {
  const starButton = getButton(e)
  const el = getGameEl(e);
  const id = el && (el.dataset as GameDataSet).id
  if (starButton) {
    ctrl.toggleBookmark(id)
  } else {
    if (id) {
      const g = ctrl.scrollState.games.find(game => game.id === id)
      const userId = ctrl.scrollState.userId
      const userColor: Color = g.players.white.userId === userId ? 'white' : 'black';
      utils.gamePosCache.set(g.id, { fen: g.fen, orientation: userColor })
      const mePlaying = session.getUserId() === userId;
      if (mePlaying || (g.source !== 'import' && g.status.id < gameStatus.ids.aborted))
        router.set(`/game/${id}/${userColor}`)
      else
        router.set(`/analyse/online/${id}/${userColor}`)
    }
  }
}

const Game: Mithril.Component<{ g: UserGameWithDate, index: number, userId: string, scrollState: ScrollState }, { boardTheme: string }> = {
  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    return attrs.g !== oldattrs.g
  },
  oninit() {
    this.boardTheme = settings.general.theme.board();
  },
  view({ attrs }) {
    const { g, index, userId, scrollState } = attrs
    const time = gameApi.time(g);
    const mode = g.rated ? i18n('rated') : i18n('casual');
    const title = g.source === 'import' ?
    `Import • ${g.variant.name}` :
    `${time} • ${g.variant.name} • ${mode}`;
    const status = gameStatus.toLabel(g.status.name, g.winner, g.variant.key) +
      (g.winner ? '. ' + i18n(g.winner === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '');
    const icon = g.source === 'import' ? '/' : utils.gameIcon(g.perf) || '';
    const userColor: Color = g.players.white.userId === userId ? 'white' : 'black';
    const evenOrOdd = index % 2 === 0 ? 'even' : 'odd';
    const star = g.bookmarked ? 't' : 's';
    const bounds = scrollState.boardBounds;
    const withStar = session.isConnected() ? ' withStar' : ''

    return (
      <li data-id={g.id} className={`userGame ${evenOrOdd}${withStar}`}>
        {renderBoard(g.fen, userColor, bounds, this.boardTheme)}
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
            win: userColor === g.winner,
            loose: g.winner && userColor !== g.winner
          })}>{status}</div>
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
    );
  }
}

function renderAllGames(ctrl: State) {
  const { games  } = ctrl.scrollState
  return (
    <div id="scroller-wrapper" className="scroller native_scroller games"
      oncreate={helper.ontapY(e => onTap(ctrl, e), null, false, getGameEl)}
      onscroll={throttle(ctrl.onScroll, 30)}
    >
      { games.length ?
        <ul className="userGames" oncreate={ctrl.onGamesLoaded}>
          { games.map((g, i) =>
            h(Game, { key: g.id, g, index: i, scrollState: ctrl.scrollState, userId: ctrl.scrollState.userId }))
          }
          {ctrl.scrollState.isLoadingNextPage ?
          <li className="list_item loadingNext">loading...</li> : null
          }
        </ul> :
        <div className="userGame-loader">
          {spinner.getVdom('monochrome')}
        </div>
      }
    </div>
  );
}

function renderBoard(fen: string, orientation: Color, bounds: Bounds, boardTheme: string) {

  const boardClass = [
    'display_board',
    boardTheme
  ].join(' ');

  return (
    <div className={boardClass} key={fen}
      oncreate={({ dom }: Mithril.DOMNode) => {
        const img = document.createElement('img')
        img.className = 'cg-board'
        img.src = 'data:image/svg+xml;utf8,' + makeBoard(fen, orientation, bounds)
        batchRequestAnimationFrame(() => {
          dom.replaceChild(img, dom.firstChild)
        })
      }}
    >
      <div className="cg-board" />
    </div>
  );
}

function renderPlayer(players: { white: UserGamePlayer, black: UserGamePlayer}, color: Color) {
  let player = players[color];
  let playerName: string;
  // TODO fetch title info from server; refactor
  if (player.userId) playerName = player.userId;
  else if (!player.aiLevel) playerName = utils.playerName(player);
  else if (player.aiLevel) {
    playerName = utils.aiName({ ai: player.aiLevel });
  }
  else playerName = 'Anonymous';

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
  );
}
