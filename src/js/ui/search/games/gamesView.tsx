import { throttle } from 'lodash';
import * as m from 'mithril';
import * as utils from '../../../utils';
import router from '../../../router';
import * as helper from '../../helper';
import * as gameApi from '../../../lichess/game';
import i18n from '../../../i18n';
import gameStatus from '../../../lichess/status';
import { toggleGameBookmark } from '../../../xhr';
import session from '../../../session';
import ViewOnlyBoard from '../../shared/ViewOnlyBoard';
import { UserGameWithDate } from '../userXhr';
import { UserGamePlayer } from '../../../lichess/interfaces/user';

import { State } from './';

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
      </div>
      {renderAllGames(ctrl)}
    </div>
  );
}

function renderAllGames(ctrl: State) {
  return (
    <div id="scroller-wrapper" className="scroller native_scroller games"
      onscroll={throttle(ctrl.onScroll, 30)}
    >
      <ul id="scroller-content" className="userGames" oncreate={ctrl.onGamesLoaded}>
        { ctrl.scrollState.games.map((g, i) => renderGame(ctrl, g, i, ctrl.scrollState.userId)) }
        {ctrl.scrollState.isLoadingNextPage ?
        <li className="list_item loadingNext">loading...</li> : null
        }
      </ul>
    </div>
  );
}

function bookmarkAction(ctrl: State, id: string, index: number) {
  return helper.ontapY(() => {
    toggleGameBookmark(id)
    .then(() => ctrl.toggleBookmark(index))
    .catch(utils.handleXhrError);
  });
}

function renderGame(ctrl: State, g: UserGameWithDate, index: number, userId: string) {
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
  const mePlaying = session.getUserId() === userId;
  const link = mePlaying || (g.source !== 'import' && g.status.id < gameStatus.ids.aborted) ?
    () => router.set(`/game/${g.id}/${userColor}`) :
    () => router.set(`/analyse/online/${g.id}/${userColor}`);

  return (
    <li className={`list_item userGame ${evenOrOdd}`} key={g.id}>
      { session.isConnected() ?
        <button className="iconStar" data-icon={star} oncreate={bookmarkAction(ctrl, g.id, index)} /> : null
      }
      <div className="userGame-wrapper" oncreate={helper.ontapY(link)}>
        {m(ViewOnlyBoard, {fen: g.fen, lastMove: g.lastMove, orientation: userColor })}
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
      </div>
    </li>
  );
}

function renderPlayer(players: { white: UserGamePlayer, black: UserGamePlayer}, color: Color) {
  let player = players[color];
  let playerName: string;
  // TODO fetch title info from server; refactor
  if (player.userId) playerName = player.userId;
  else if (!player.aiLevel) playerName = utils.playerName(player);
  else if (player.aiLevel) {
    player.ai = player.aiLevel;
    playerName = utils.aiName(player);
  }
  else playerName = 'Anonymous';

  return (
    <div className={'player ' + color}>
      <span className="playerName">{playerName}</span>
      <br/>
      {player.rating ?
      <small className="playerRating">{player.rating}{player.conditional && '?'}</small> : null
      }
      {player.ratingDiff ?
        helper.renderRatingDiff(player) : null
      }
    </div>
  );
}
