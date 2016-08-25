import h from '../helper';
import router from '../../router';
import {header } from '../shared/common';
import { pad, formatTournamentDuration, formatTournamentTimeControl, capitalize } from '../../utils';
import layout from '../layout';
import i18n from '../../i18n';
import * as m from 'mithril';
import tabs from '../shared/tabs';

export default function view(vnode) {
  const ctrl = vnode.state;
  const bodyCtrl = tournamentListBody.bind(undefined, ctrl);

  return layout.free(header.bind(undefined, i18n('tournaments')), bodyCtrl);
}

const TABS = [{
    key: 'started',
    label: 'In Progress'
}, {
    key: 'created',
    label: 'Upcoming'
}, {
    key: 'finished',
    label: 'Completed'
}];

function tabNavigation (currentTabFn) {
    return m('.nav-header', m(tabs, {
        buttons: TABS,
        selectedTab: currentTabFn(),
        onTabChange: k => {
          const loc = window.location.search.replace(/\?tab\=\w+$/, '');
          window.history.replaceState(null, null, loc + '?tab=' + k);
          currentTabFn(k);
        }
    }));
}

function tournamentListBody(ctrl) {
  if (!ctrl.tournaments()) return null;

  const id = ctrl.currentTab();
  const tabContent = ctrl.tournaments()[id];

  return (
    <div className="tournamentTabsWrapper">
      {tabNavigation(ctrl.currentTab)}
      <div className="native_scroller tournamentList">
        <table>
          <tbody>
            {tabContent.map(renderTournamentListItem)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderTournamentListItem(tournament) {
  const time = formatTournamentTimeControl(tournament.clock);
  const mode = tournament.rated ? i18n('rated') : i18n('casual');
  const duration = formatTournamentDuration(tournament.minutes);
  const variant = tournament.variant.key !== 'standard' ?
    capitalize(tournament.variant.short) : '';

  return (
    <tr key={tournament.id}
      className={'list_item tournament_item' + (tournament.createdBy === 'lichess' ? ' official' : '')}
      oncreate={h.ontouchY(() => router.set('/tournament/' + tournament.id))}
    >
      <td className="tournamentListName" data-icon={tournament.perf.icon}>
        <div className="fullName">{tournament.fullName}</div>
        <small className="infos">{time} {variant} {mode} • {duration}</small>
      </td>
      <td className="tournamentListTime">
        <div className="time">{formatTime(tournament.startsAt)} <strong className="timeArrow">-</strong> {formatTime(tournament.finishesAt)}</div>
        <small className="nbUsers withIcon" data-icon="r">{tournament.nbPlayers}</small>
      </td>
      <td className="tournamentListNav">
        &#xf054;
      </td>
    </tr>
  );
}

function formatTime(timeInMillis) {
  const date = new Date(timeInMillis);
  const hours = pad(date.getHours().toString(), 2);
  const mins = pad(date.getMinutes().toString(), 2);
  return hours + ':' + mins;
}
