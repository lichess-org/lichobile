import socket from '../../../socket';
import * as utils from '../../../utils';
import * as xhr from '../tournamentXhr';
import helper from '../../helper';
import m from 'mithril';

export default function controller() {
  helper.analyticsTrackView('Tournament List');

  const tournaments = m.prop({});
  const currentTab = m.prop(m.route.param('tab') || 'started');

  xhr.currentTournaments().then(data => {
    tournaments(data);
    return data;
  }, err => utils.handleXhrError(err));

  socket.createDefault();

  return {
    tournaments,
    currentTab
  };
}
