import h from '../../helper';
import {header, pad} from '../../shared/common';
import layout from '../../layout';
import i18n from '../../../i18n';
import m from 'mithril';
import tabs from '../../shared/tabs';
import isEmpty from 'lodash/isEmpty';

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
  if (isEmpty(ctrl.tournaments())) return null;
  const tabContent = ctrl.tournaments()[ctrl.currentTab()];

  return m('.module-tabs.tabs-routing', [
    tabNavigation(ctrl.currentTab),
    m('.tab-content.layout.center-center.native_scroller',
      m('div', renderTournamentList(tabContent, ctrl.currentTab()))
    )
  ]);
}

function renderTournamentList (list, id) {
  return (
    <div key={id} className='tournamentList'>
      <table className='tournamentList'>
        {list.map(renderTournamentListItem)}
      </table>
    </div>
  );
}

function renderTournamentListItem(tournament) {
  return (
    <tr key={tournament.id} className='list_item' config={h.ontouchY(() => m.route('/tournament/' + tournament.id))}>
      <td className='tournamentListName'>{tournament.fullName}</td>
      <td className='tournamentListTime'>{formatTime(tournament.startsAt)} <strong className='timeArrow'> → </strong> {formatTime(tournament.finishesAt)}</td>
      <td className='tournamentListNav'>&#xf054;</td>
    </tr>
  );
}

function formatTime(timeInMillis) {
  let date = new Date(timeInMillis);
  let hours = pad(date.getHours().toString(), 2);
  let mins = pad(date.getMinutes().toString(), 2);
  return hours + ':' + mins;
}
