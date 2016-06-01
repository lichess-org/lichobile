import socket from '../../../socket';
import throttle from 'lodash/throttle';
import * as utils from '../../../utils';
import * as xhr from '../tournamentXhr';
import helper from '../../helper';
import faq from '../faq';
import playerInfo from '../playerInfo';
import m from 'mithril';

export default function controller() {
  helper.analyticsTrackView('Tournament details');

  const tournament = m.prop();
  const hasJoined = m.prop(false);
  const page = m.prop(null);
  const isLoading = m.prop(false);
  const faqCtrl = faq.controller(tournament);
  const playerInfoCtrl = playerInfo.controller(tournament);

  function reload(data) {
    isLoading(false);
    const oldData = tournament();
    if (data.featured && (data.featured.id !== oldData.featured.id)) {
      socket.send('startWatching', data.featured.id);
    }
    else if (data.featured && (data.featured.id === oldData.featured.id)) {
      data.featured = oldData.featured;
    }
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
      page(null); // Reset the page so next reload goes to player position
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

  const throttledReload = throttle((t, p) => {
    if (p) {
      page(p);
    }
    isLoading(true);
    xhr.reload(t, page())
    .then(reload)
    .catch(() => isLoading(false));
  }, 1000);

  const handlers = {
    reload: () => throttledReload (id),
    resync: () => throttledReload (id),
    redirect: function(gameId) {
      m.route('/tournament/' + tournament().id + '/game/' + gameId, null, true);
    },
    fen: function(d) {
      const featured = tournament().featured;
      if (!featured) return;
      if (featured.id !== d.id) return;
      featured.fen = d.fen;
      featured.lastMove = d.lm;
      m.redraw();
    }
  };

  let clockInterval = null;
  xhr.tournament(id).then(data => {
    tournament(data);
    hasJoined(data.me && !data.me.withdraw);
    clockInterval = setInterval(tick, 1000);
    const featuredGame = data.featured ? data.featured.id : null;
    socket.createTournament(id, tournament().socketVersion, handlers, featuredGame);
  })
  .catch(utils.handleXhrError);

  return {
    tournament,
    hasJoined,
    faqCtrl,
    playerInfoCtrl,
    join: throttle(join, 1000),
    withdraw: throttle(withdraw, 1000),
    reload: throttledReload,
    isLoading,
    onunload: () => {
      socket.destroy();
      if (clockInterval) {
        clearInterval(clockInterval);
      }
    }
  };
}
