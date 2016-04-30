import socket from '../../../socket';
import * as utils from '../../../utils';
import * as xhr from '../tournamentXhr';
import helper from '../../helper';
import m from 'mithril';

export default function controller() {
  const id = m.route.param('id');

  helper.analyticsTrackView('Tournament details');

  const tournament = m.prop();

  function reload(data) {
    tournament(data);
    if (data.socketVersion)
      socket.setVersion(data.socketVersion);
    m.redraw();
  }

  function tick() {
    let data = tournament();
    if (data.secondsToStart && data.secondsToStart > 0) {
      data.secondsToStart--;
    }

    if (data.secondsToFinish && data.secondsToFinish > 0) {
      data.secondsToFinish--;
    }

    m.redraw();
  }

  let clockInterval = null;

  xhr.tournament(id).then(data => {
    tournament(data);
    clockInterval = setInterval(tick, 1000);
    socket.createTournament(id, tournament().socketVersion, {
      reload: () => xhr.reload(id).then(reload)
    });
  })
  .catch(utils.handleXhrError);

  return {
    tournament,
    reload,
    onunload: () => {
      socket.destroy();
      if (clockInterval) {
        clearInterval(clockInterval);
      }
    }
  };
}
