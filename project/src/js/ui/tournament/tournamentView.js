import * as utils from '../../utils';
import h from '../helper';
import { header as headerWidget, backButton, empty, menuButton } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';
import m from 'mithril';
import tabs from 'polythene/tabs/tabs';

export default function view(ctrl) {
  if (ctrl.tournaments)
    return tournamentList(ctrl);
  else
    return tournamentHome(ctrl);
}

// === Tournament List Section === //

const TABS = [{
    id: 'started',
    label: 'In Progress'
}, {
    id: 'created',
    label: 'Upcoming'
}, {
    id: 'finished',
    label: 'Completed'
}];

const tabNavigation = (currentTabFn) => {
    return m('.nav-header .tab-header', m.component(tabs, {
        buttons: TABS,
        autofit: true,
        selectedTab: currentTabFn(),
        activeSelected: true,
        getState: (state) => {
            currentTabFn(state.index);
        }
    }));
};

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
  let arrayName = TABS[ctrl.currentTab()].id;
  return (
    <div>
      {m('.module-tabs.tabs-routing', [
          tabNavigation(ctrl.currentTab),
          m('.tab-content.layout.center-center',
              m('div', renderTournamentList(ctrl.tournaments()[arrayName], arrayName))
          )
      ])}
    </div>
  );
}

function renderTournamentList (list, id) {
  console.log('id: ' + id);
  return (
    <div id={id} className="tournamentList">
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
    <tr id={tournament.id} className="tournamentListItem" config={h.ontouchY(() => m.route('/tournament/' + tournament.id))}>
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

// === Individual Tournament Section === //

function tournamentHome(ctrl) {
  const headerCtrl = utils.partialf(headerWidget, null,
    backButton(ctrl.tournament().fullName)
  );
  const bodyCtrl = tournamentHomeBody.bind(undefined, ctrl);

  return layout.free(headerCtrl, bodyCtrl, empty, empty);
}

function tournamentHomeBody(ctrl) {
  let data = ctrl.tournament();
  let tournamentBody = '';
  if (!data.isStarted)
    tournamentBody = tournamentHomeBodyCreated(data);
  else if (data.isFinished)
    tournamentBody = tournamentHomeBodyFinished(data);
  else
    tournamentBody = tournamentHomeBodyStarted(data);

  return (tournamentBody);
}

function tournamentHomeBodyCreated(data) {
  return (
    <div className="tournamentContainer">
      { tournamentLeaderboard(data, false) }
    </div>
  );
}

function tournamentHomeBodyFinished(data) {
  return (
    <div className="tournamentContainer">
      { tournamentLeaderboard(data, true) }
    </div>
  );
}

function tournamentHomeBodyStarted(data) {
  return (
    <div className="tournamentContainer">
      { tournamentLeaderboard(data, false) }
      { tournamentFeaturedGame(data) }
    </div>
  );
}

function tournamentLeaderboard(data) {
  return (
    <div className="tournamentLeaderboard">
      <p className="tournamentHeader">Leaderboard ({data.nbPlayers} Players)</p>
      <table className="tournamentStandings">
        {data.standing.players.map(renderLeaderboardItem)}
      </table>
    </div>
  );
}

function tournamentFeaturedGame(data) {
  return (
    <div className="tournamentGames">
      <p className="tournamentHeader">Featured Game</p>
      <div class="tournamentFeatured nav" config={h.ontouchY(() => m.route('/game/' + data.featured.id))}>
        {data.featured.white.name} ({data.featured.white.rating}) vs. {data.featured.black.name} ({data.featured.black.rating})
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
