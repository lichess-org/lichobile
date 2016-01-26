import * as utils from '../../utils';
import h from '../helper';
import { empty, menuButton } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';
import m from 'mithril';

export default function view(ctrl) {
  const headerCtrl = header.bind(undefined, ctrl);
  const bodyCtrl = body.bind(undefined, ctrl);

  return layout.free(headerCtrl, bodyCtrl, empty, empty);
}

function header(ctrl) {
  return (
    <nav>
      {menuButton()}
      <h1>{i18n('tournaments')}</h1>
    </nav>
  );
}

function body(ctrl) {
  return (
    <table className="currentTournaments native_scroller page">
      <tr>
        <th> Name </th>
        <th> Start </th>
        <th> End </th>
      </tr>
      {ctrl.tournaments().created.map(renderTournament)}
    </table>
  );
}

function renderTournament(tournament) {
  return (
    <tr className="list_item nav" config={h.ontouchY(() => m.route('/tournament' + tournament.id))}>
      <td>{tournament.fullName}</td>
      <td>{formatTime(tournament.startsAt)}</td>
      <td>{formatTime(tournament.finishesAt)}</td>
    </tr>
  );
}

function formatTime(unixTime) {
  let date = new Date(unixTime * 1000);
  let hours = date.getHours().toString();
  if (hours.length < 2)
    hours = '0' + hours;
  let mins = date.getMinutes().toString();
    if (mins.length < 2)
      hours = '0' + hours;
  return hours + ':' + mins;
}
