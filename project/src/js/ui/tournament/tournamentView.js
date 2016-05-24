import h from '../helper';
import {header } from '../shared/common';
import { pad, formatTournamentDuration, formatTournamentTimeControl, capitalize } from '../../utils';
import layout from '../layout';
import i18n from '../../i18n';
import m from 'mithril';
import tabs from '../shared/tabs';

export default function view(ctrl) {
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
    return m('.nav-header', m.component(tabs, {
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

  const tabContent = ctrl.tournaments()[ctrl.currentTab()];

  return m('.module-tabs.tabs-routing', [
    tabNavigation(ctrl.currentTab),
    m('.tab-content.layout.center-center.native_scroller',
      renderTournamentList(tabContent, ctrl.currentTab())
    )
  ]);
}

function renderTournamentList (list, id) {
  return (
    <table key={id} className='tournamentList'>
      {list.map(renderTournamentListItem)}
    </table>
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
      config={h.ontouchY(() => m.route('/tournament/' + tournament.id))}
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
