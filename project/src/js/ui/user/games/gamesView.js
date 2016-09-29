import * as utils from '../../../utils';
import router from '../../../router';
import * as helper from '../../helper';
import { header as headerWidget, backButton } from '../../shared/common';
import layout from '../../layout';
import * as gameApi from '../../../lichess/game';
import i18n from '../../../i18n';
import gameStatus from '../../../lichess/status';
import { toggleGameBookmark } from '../../../xhr';
import session from '../../../session';
import * as m from 'mithril';
import ViewOnlyBoard from '../../shared/ViewOnlyBoard';

export default function view(vnode) {
  const ctrl = this;
  const username = vnode.attrs.id;

  const header = headerWidget.bind(undefined, null,
    backButton(username + ' games')
  );

  function renderBody() {
    return (
      <div className="userGamesWrapper">
        <div className="select_input select_games_filter">
          <label htmlFor="filterGames"></label>
          <select id="filterGames" onchange={ctrl.onFilterChange}>
            {ctrl.availableFilters().map(f => {
              return (
                <option value={f.key} selected={ctrl.currentFilter() === f.key}>
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

  return layout.free(header, renderBody);
}

function renderAllGames(ctrl) {
  return (
    <div className="scroller games" oncreate={ctrl.scrollerOnCreate}
      onupdate={ctrl.scrollerOnUpdate} onremove={ctrl.scrollerOnRemove}
    >
      <ul className="userGames">
        { ctrl.games().map((g, i) => renderGame(ctrl, g, i, ctrl.userId)) }
        {ctrl.isLoadingNextPage() ?
        <li className="list_item loadingNext">loading...</li> : null
        }
      </ul>
    </div>
  );
}

function bookmarkAction(ctrl, id, index) {
  const longAction = () => window.plugins.toast.show(i18n('bookmarkThisGame'), 'short', 'top');
  return helper.ontapY(() => {
    toggleGameBookmark(id)
    .then(() => {
      ctrl.toggleBookmark(index);
    })
    .catch(utils.handleXhrError);
  }, longAction);
}

function renderGame(ctrl, g, index, userId) {
  const wideScreenOrLandscape = helper.isWideScreen() || helper.isLandscape();
  const time = gameApi.time(g);
  const mode = g.rated ? i18n('rated') : i18n('casual');
  const title = time + ' • ' + g.variant.name + ' • ' + mode;
  const date = window.moment(g.timestamp).calendar();
  const status = gameStatus.toLabel(g.status.name, g.winner, g.variant.key) +
    (g.winner ? '. ' + i18n(g.winner === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '');
  const icon = utils.gameIcon(g.perf) || '';
  const userColor = g.players.white.userId === userId ? 'white' : 'black';
  const evenOrOdd = index % 2 === 0 ? 'even' : 'odd';
  const star = g.bookmarked ? 't' : 's';
  const link = g.winner ? () => router.set(`/analyse/online/${g.id}/${userColor}`) : () => router.set(`/game/${g.id}/${userColor}`);

  return (
    <li className={`list_item userGame ${evenOrOdd}`} key={g.id}>
      { session.isConnected() ?
        <button className="iconStar" data-icon={star} oncreate={bookmarkAction(ctrl, g.id, index)} /> : null
      }
      <div className="nav" oncreate={helper.ontapY(link)}>
        <span className="iconGame" data-icon={icon} />
        {wideScreenOrLandscape ? m(ViewOnlyBoard, {fen: g.fen, lastMove: g.lastMove, orientation: userColor }) : null}
        <div className="infos">
          <div className="title">{title}</div>
          <small className="date">{date}</small>
          <div className="players">
            {renderPlayer(g.players, 'white', g.variant.key)}
            <div className="swords" data-icon="U" />
            {renderPlayer(g.players, 'black', g.variant.key)}
          </div>
          <div className={helper.classSet({
            status: true,
            win: userColor === g.winner,
            loose: g.winner && userColor !== g.winner
          })}>{status}</div>
          {g.opening ?
          <p className="opening">{g.opening.name}</p> : null
          }
          {g.analysed ?
          <p className="analysed">
            <span className="fa fa-bar-chart" />
            Computer analysis available
          </p> : null
          }
        </div>
      </div>
    </li>
  );
}

function renderPlayer(players, color, variant) {
  let player = players[color];
  let playerName;
  if (player.userId) playerName = player.userId;
  else if (player.aiLevel) {
    player.ai = player.aiLevel;
    player.engineName = variant === 'crazyhouse' ? 'Sunsetter' : 'Stockfish';
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
    </div>
  );
}
