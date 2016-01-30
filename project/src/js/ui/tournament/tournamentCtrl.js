import socket from '../../socket';
import * as utils from '../../utils';
import * as xhr from './tournamentXhr';
import helper from '../helper';
import m from 'mithril';

export default function controller() {
  const tournamentId = m.route.param('id');
  if (!tournamentId)
    return tournamentList();
  else
    return tournamentHome(tournamentId);
}

function tournamentList() {
  socket.createDefault();

  helper.analyticsTrackView('Tournament List');

  const tournaments = m.prop([]);

  xhr.currentTournaments().then(data => {
    console.log(data);
    tournaments(data);
    return data;
  }, err => utils.handleXhrError(err));

  return {
    tournaments,
    onunload: () => {
      socket.destroy();
    }
  };
}

function tournamentHome(tournamentId) {
  socket.createDefault();

  helper.analyticsTrackView('Tournament Home' + tournamentId);

  const tournament = m.prop([]);

  xhr.tournament(tournamentId).then(data => {
    console.log(data);
    tournament(data);
    return data;
  }, err => utils.handleXhrError(err));

  return {
    tournament,
    onunload: () => {
      socket.destroy();
    }
  };
}
