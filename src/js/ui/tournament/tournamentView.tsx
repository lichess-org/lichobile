import * as helper from '../helper';
import router from '../../router';
import session from '../../session';
import { header } from '../shared/common';
import { pad, formatTournamentDuration, formatTournamentTimeControl, capitalize } from '../../utils';
import layout from '../layout';
import i18n from '../../i18n';
import * as h from 'mithril/hyperscript';
import tabs from '../shared/tabs';
import newTournamentForm from './newTournamentForm';
import { TournamentListsState, TournamentListItem } from './interfaces';

export default function view(vnode: Mithril.Vnode<{}, TournamentListsState>) {
  const ctrl = vnode.state
  const bodyCtrl = tournamentListBody.bind(undefined, ctrl)
  const footer = session.isConnected() ? () => renderFooter() : null
  const overlay = () => newTournamentForm.view(ctrl)

  return layout.free(() => header(i18n('tournaments')), bodyCtrl, footer, overlay)
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

function tabNavigation (currentTabFn: Mithril.Stream<string>) {
    return h('.tabs-nav-header', [
      h(tabs, {
          buttons: TABS,
          selectedTab: currentTabFn(),
          onTabChange: (k: string) => {
            const loc = window.location.search.replace(/\?tab\=\w+$/, '');
            try {
              window.history.replaceState(window.history.state, null, loc + '?tab=' + k);
            } catch (e) { console.error(e) }
            currentTabFn(k);
          }
      }),
      h('div.main_header_drop_shadow')
    ]);
}

function tournamentListBody(ctrl: TournamentListsState) {
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

function renderTournamentListItem(tournament: TournamentListItem) {
  const time = formatTournamentTimeControl(tournament.clock);
  const mode = tournament.rated ? i18n('rated') : i18n('casual');
  const duration = formatTournamentDuration(tournament.minutes);
  const variant = tournament.variant.key !== 'standard' ?
    capitalize(tournament.variant.short) : '';

  return (
    <tr key={tournament.id}
      className={'list_item tournament_item' + (tournament.createdBy === 'lichess' ? ' official' : '')}
      oncreate={helper.ontapY(() => router.set('/tournament/' + tournament.id))}
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

function renderFooter() {
  return (
    <div className="actions_bar">
      <button key="createTournament" className="action_bar_button" oncreate={helper.ontap(newTournamentForm.open)}>
        <span className="fa fa-pencil" />
        {i18n('createANewTournament')}
      </button>
    </div>
  );
}

function formatTime(timeInMillis: number) {
  const date = new Date(timeInMillis);
  const hours = pad(date.getHours(), 2);
  const mins = pad(date.getMinutes(), 2);
  return hours + ':' + mins;
}
