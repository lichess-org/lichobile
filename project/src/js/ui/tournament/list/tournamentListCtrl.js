import socket from '../../../socket';
import * as utils from '../../../utils';
import * as xhr from '../tournamentXhr';
import helper from '../../helper';
import m from 'mithril';

export default function controller() {
  socket.createDefault();
  helper.analyticsTrackView('Tournament List');
  const tournaments = m.prop([]);

  xhr.currentTournaments().then(data => {
    tournaments(data);
    return data;
  }, err => utils.handleXhrError(err));

  const currentTab = m.prop(0);
  return {
    tournaments,
    currentTab,
    onunload: () => {
      socket.destroy();
    }
  };
}
