import socket from '../../socket';
import { handleXhrError } from '../../utils';
import * as xhr from './tournamentXhr';
import helper from '../helper';
import settings from '../../settings';
import m from 'mithril';

export default function oninit(vnode) {
  helper.analyticsTrackView('Tournament List');

  socket.createDefault();

  const tournaments = m.prop();
  const currentTab = m.prop(vnode.attrs.tab || 'started');

  xhr.currentTournaments()
  .then(data => {
    data.started = data.started.filter(supported);
    data.created = data.created.filter(supported);
    data.finished = data.finished.filter(supported);
    data.started.sort(sortByLichessAndDate);
    data.finished.sort(sortByEndDate);
    tournaments(data);
    return data;
  })
  .catch(handleXhrError);

  vnode.state = {
    tournaments,
    currentTab
  };
}

function supported(t) {
  return settings.game.supportedVariants.indexOf(t.variant.key) !== -1;
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
