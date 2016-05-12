import socket from '../../socket';
import * as utils from '../../utils';
import * as xhr from './tournamentXhr';
import helper from '../helper';
import * as m from 'mithril';

export default function controller() {
  helper.analyticsTrackView('Tournament List');

  socket.createDefault();

  const tournaments = m.prop();
  const currentTab = m.prop(m.route.param('tab') || 'started');

  xhr.currentTournaments().then(data => {
    tournaments(data);
    return data;
  }).catch(utils.handleXhrError);

  return {
    tournaments,
    currentTab
  };
}
