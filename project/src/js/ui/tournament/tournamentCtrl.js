import socket from '../../socket';
import * as utils from '../../utils';
import * as xhr from './tournamentXhr';
import socketHandler from './socketHandler';
import helper from '../helper';
import m from 'mithril';

const tournament = m.prop([]);

export default function controller() {
  let id = m.route.param('id');
  helper.analyticsTrackView('Tournament ' + id);

  let clockInterval = null;
  xhr.tournament(id).then(data => {
    tournament(data);
    clockInterval = setInterval(tick, 1000);
    return data;
  }, err => utils.handleXhrError(err));

  let returnVal = {
    tournament,
    reload,
    onunload: () => {
      socket.destroy();
      if(clockInterval)
        clearInterval(clockInterval);
    }
  };

  socket.createTournament(tournament().socketVersion, id, socketHandler(returnVal));
  return returnVal;
}

function reload (data) {
  tournament(data);
  if(data.socketVersion)
    socket.setVersion(data.socketVersion);
  m.redraw();
}

function tick () {
  let data = tournament();
  if(data.secondsToStart && data.secondsToStart > 0)
    data.secondsToStart--;

  if(data.secondsToFinish && data.secondsToFinish > 0)
    data.secondsToFinish--;

  m.redraw();
}
