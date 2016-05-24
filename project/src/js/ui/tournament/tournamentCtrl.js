import socket from '../../socket';
import * as utils from '../../utils';
import * as xhr from './tournamentXhr';
import helper from '../helper';
import m from 'mithril';

export default function controller() {
  helper.analyticsTrackView('Tournament List');

  socket.createDefault();

  const tournaments = m.prop();
  const currentTab = m.prop(m.route.param('tab') || 'started');

  xhr.currentTournaments().then(data => {
    data.started.sort(sortByLichessAndDate);
    data.finished.sort(sortByEndDate);
    tournaments(data);
    return data;
  }).catch(utils.handleXhrError);

  return {
    tournaments,
    currentTab
  };
}

function sortByLichessAndDate(a, b) {
  if (a.createdBy === 'lichess' && b.createdBy === 'lichess') {
    return a.startsAt - b.startsAt;
  } else if (a.createdBy === 'lichess') {
    return -1;
  } else {
    return 1;
  }
}

function sortByEndDate(a, b) {
  return b.finishesAt - a.finishesAt;
}
