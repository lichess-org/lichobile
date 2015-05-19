/** @jsx m */
import utils from '../../../utils';
import helper from '../../helper';
import widgets from '../../widget/common';
import layout from '../../layout';
import gameApi from '../../../lichess/game';
import i18n from '../../../i18n';
import gameStatus from '../../../lichess/status';
const moment = window.moment;

export default function view(ctrl) {
  const header = utils.partialf(widgets.header, null,
    widgets.backButton(m.route.param('id') + ' games')
  );

  function renderBody() {
    return (
      <div className="userGamesWrapper">
        <div className="select_input select_games_filter">
          <label htmlFor="filterGames">Filter games</label>
          <select id="filterGames" onchange={ctrl.onFilterChange}>
            {ctrl.availableFilters.map(f => {
              return (
                <option value={f.key} selected={ctrl.currentFilter() === f.key}>{f.key}</option>
              );
            })}
          </select>
        </div>
        {renderAllGames(ctrl)}
      </div>
    );
  }

  return layout.free(header, renderBody, widgets.empty, widgets.empty);
}

function renderAllGames(ctrl) {
  return (
    <div className="scroller games" config={ctrl.scrollerConfig}>
      <ul className="userGames">
        { ctrl.games().map((g, i) => renderGame(g, i, ctrl.userId)) }
        {helper.cond(ctrl.isLoadingNextPage(),
        <li className="loadingNext">loading...</li>
        )}
      </ul>
    </div>
  );
}

function renderGame(g, index, userId) {
  const time = gameApi.time(g);
  const mode = g.rated ? i18n('rated') : i18n('casual');
  const title = time + ' • ' + g.variant.name + ' • ' + mode;
  const date = moment(g.timestamp).calendar();
  const status = gameStatus.toLabel(g.status.name, g.winner, g.variant.key) +
    (g.winner ? '. ' + i18n(g.winner === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '');
  const userColor = g.players.white.userId === userId ? 'white' : 'black';
  const evenOrOdd = index % 2 === 0 ? 'even' : 'odd';

  return (
    <li className={`list_item userGame ${evenOrOdd}`}>
      <span className="iconGame" data-icon={utils.gameIcon(g.perf)} />
      <div className="infos">
        <div className="title">{title}</div>
        <small className="date">{date}</small>
        <div className="players">
          <div className="player white">
            <span className="playerName">{g.players.white.userId}</span>
            <br/>
            <small className="playerRating">{g.players.white.rating}</small>
          </div>
          <div className="swords" data-icon="U" />
          <div className="player black">
            <span className="playerName">{g.players.black.userId}</span>
            <br/>
            <small className="playerRating">{g.players.black.rating}</small>
          </div>
        </div>
        <div className={helper.classSet({
          status: true,
          win: userColor === g.winner,
          loose: g.winner && userColor !== g.winner
        })}>{status}</div>
      </div>
    </li>
  );
}
