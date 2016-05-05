import socket from '../../../socket';
import throttle from 'lodash/throttle';
import * as utils from '../../../utils';
import * as xhr from '../tournamentXhr';
import helper from '../../helper';
import m from 'mithril';

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
    let data = tournament();
    if (data.secondsToStart && data.secondsToStart > 0) {
      data.secondsToStart--;
    }
    if (data.secondsToFinish && data.secondsToFinish > 0) {
      data.secondsToFinish--;
    }
    m.redraw();
  }

  function join_unthrottled(id) {
    if (!id) {
      id = tournament().id;
    }
    xhr.join(id).then(() => {
      hasJoined(true);
      m.redraw();
    }, err => utils.handleXhrError(err));
  }

  function withdraw_unthrottled(id) {
    if (!id) {
      id = tournament().id;
    }
    xhr.withdraw(id).then(() => {
      hasJoined(false);
      m.redraw();
    }, err => utils.handleXhrError(err));
  }

  let id = m.route.param('id');
  let action = m.route.param('action');
  if (action && action === 'withdraw') {
    withdraw(id);
  }
  let clockInterval = null;

  const handlers = {
    reload: throttle(() => {
      xhr.reload(tournament().id).then(reload);
    }, 1000),
    redirect: function(gameId) {
      m.route('/tournament/' + tournament().id + '/game/' + gameId);
    }
  };

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
    join: throttle(join_unthrottled, 1000),
    withdraw: throttle(withdraw_unthrottled, 1000),
    reload,
    onunload: () => {
      socket.destroy();
      if (clockInterval)
      clearInterval(clockInterval);
    }
  };
}
