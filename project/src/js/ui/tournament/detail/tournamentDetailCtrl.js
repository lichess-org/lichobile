import socket from '../../../socket';
import { throttle } from 'lodash/function';
import * as utils from '../../../utils';
import * as xhr from '../tournamentXhr';
import helper from '../../helper';
import * as m from 'mithril';

export default function controller() {
  helper.analyticsTrackView('Tournament details');

  const tournament = m.prop();
  const hasJoined = m.prop(false);

  function reload(data) {
    tournament(data);
    hasJoined(data.me && !data.me.withdraw);

    if (data.socketVersion) {
      socket.setVersion(data.socketVersion);
    }
    m.redraw();
  }

  function tick() {
    const data = tournament();
    if (data.secondsToStart && data.secondsToStart > 0) {
      data.secondsToStart--;
    }
    if (data.secondsToFinish && data.secondsToFinish > 0) {
      data.secondsToFinish--;
    }
    m.redraw();
  }

  function join(id) {
    xhr.join(id).then(() => {
      hasJoined(true);
      m.redraw();
    }).catch(utils.handleXhrError);
  }

  function withdraw(id) {
    xhr.withdraw(id).then(() => {
      hasJoined(false);
      m.redraw();
    }).catch(utils.handleXhrError);
  }

  const id = m.route.param('id');

  const throttledReload = throttle(() => {
    xhr.reload(tournament().id).then(reload);
  }, 1000);

  const handlers = {
    reload: throttledReload,
    resync: throttledReload,
    redirect: function(gameId) {
      m.route('/tournament/' + tournament().id + '/game/' + gameId);
    }
  };

  let clockInterval = null;
  xhr.tournament(id).then(data => {
    tournament(data);
    hasJoined(data.me && !data.me.withdraw);
    clockInterval = setInterval(tick, 1000);
    socket.createTournament(id, tournament().socketVersion, handlers);
  })
  .catch(utils.handleXhrError);

  return {
    tournament,
    hasJoined,
    join: throttle(join, 1000),
    withdraw: throttle(withdraw, 1000),
    reload,
    onunload: () => {
      socket.destroy();
      if (clockInterval) {
        clearInterval(clockInterval);
      }
    }
  };
}
