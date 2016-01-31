import * as utils from '../../utils';
import h from '../helper';
import { header as headerWidget, backButton, empty, menuButton } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';
import m from 'mithril';

export default function view(ctrl) {
  if (ctrl.tournaments)
    return tournamentList(ctrl);
  else
    return tournamentHome(ctrl);
}


function tournamentList(ctrl) {
  const headerCtrl = tournamentListHeader.bind(undefined, ctrl);
  const bodyCtrl = tournamentListBody.bind(undefined, ctrl);

  return layout.free(headerCtrl, bodyCtrl, empty, empty);
}

function tournamentListHeader() {
  return (
    <nav>
      {menuButton()}
      <h1>{i18n('tournaments')}</h1>
    </nav>
  );
}

function tournamentListBody(ctrl) {
  return (
    <div className="allTournamentLists native_scroller page">
      {renderTournamentList('In Progress', ctrl.tournaments().started)}
      {renderTournamentList('Starting Soon', ctrl.tournaments().created)}
      {renderTournamentList('Completed', ctrl.tournaments().finished)}
    </div>
  );
}

function renderTournamentList (title, list) {
  return (
    <div className="tournamentList">
      <p className="tournamentHeader"> {title} </p>
      <table className="tournamentList">
        <tr>
          <th className="tournamentHeader"> Name </th>
          <th className="tournamentHeader"> Start </th>
          <th className="tournamentHeader"> End </th>
          <th> </th>
        </tr>
        {list.map(renderTournamentListItem)}
      </table>
    </div>
  );
}

function renderTournamentListItem(tournament) {
  return (
    <tr className="tournamentListItem" config={h.ontouchY(() => m.route('/tournament/' + tournament.id))}>
      <td className="tournamentListName">{tournament.fullName}</td>
      <td className="tournamentListTime">{formatTime(tournament.startsAt)}</td>
      <td className="tournamentListTime">{formatTime(tournament.finishesAt)}</td>
      <td className="tournamentListNav">&#xf054;</td>
    </tr>
  );
}

function formatTime(timeInMillis) {
  let date = new Date(timeInMillis);
  let hours = date.getHours().toString();
  if (hours.length < 2)
    hours = '0' + hours;
  let mins = date.getMinutes().toString();
  if (mins.length < 2)
    mins = '0' + mins;
  return hours + ':' + mins;
}

function tournamentHome(ctrl) {
  const headerCtrl = utils.partialf(headerWidget, null,
    backButton(ctrl.tournament().fullName)
  );
  const bodyCtrl = tournamentHomeBody.bind(undefined, ctrl);

  return layout.free(headerCtrl, bodyCtrl, empty, empty);
}

function tournamentHomeBody(ctrl) {
  let data = ctrl.tournament();
  return (
    <div className="tournamentContainer">
      <div className="tournamentLeaderboard">
        <p className="tournamentHeader">Leaderboard ({data.nbPlayers} Players)</p>
        <table className="tournamentStandings">
          {data.standing.players.map(renderLeaderboardItem)}
        </table>
      </div>
      <div className="tournamentGames">
        <p className="tournamentHeader">Featured Game</p>
        <div class="tournamentFeatured nav" config={h.ontouchY(() => m.route('/game/' + data.featured.id))}>
          {data.featured.white.name} ({data.featured.white.rating}) vs. {data.featured.black.name} ({data.featured.black.rating})
        </div>
      </div>
    </div>
  );
}

function renderLeaderboardItem(player) {
  return (
    <tr className="tournamentListItem">
      <td className="tournamentPlayer">{player.name + '(' + player.rating + ')'}</td>
      <td className="tournamentPoints"><strong className={player.sheet.fire ? 'on-fire' : 'off-fire'} data-icon='Q'>{player.score}</strong></td>
    </tr>
  );
}
