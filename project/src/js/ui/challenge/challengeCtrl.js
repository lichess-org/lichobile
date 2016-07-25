import { handleXhrError, backHistory } from '../../utils';
import throttle from 'lodash/throttle';
import { acceptChallenge, declineChallenge, cancelChallenge, getChallenge } from '../../xhr';
import challengesApi from '../../lichess/challenges';
import i18n from '../../i18n';
import socket from '../../socket';
import m from 'mithril';

const throttledPing = throttle(() => socket.send('ping'), 1000);

export default function oninit(vnode) {
  var pingTimeoutId;
  const challenge = m.prop();

  function reloadChallenge() {
    getChallenge(challenge().id).run(d => {
      clearTimeout(pingTimeoutId);
      challenge(d.challenge);
      switch (d.challenge.status) {
        case 'accepted':
          m.route.set(`/game/${d.challenge.id}`, null, true);
          break;
        case 'declined':
          window.plugins.toast.show(i18n('challengeDeclined'), 'short', 'center');
          backHistory();
          break;
      }
    }, err => {
      clearTimeout(pingTimeoutId);
      handleXhrError(err);
      m.route.set('/');
    });
  }

  function pingNow() {
    throttledPing();
    pingTimeoutId = setTimeout(pingNow, 2000);
  }

  getChallenge(vnode.attrs.id).run(d => {
    challenge(d.challenge);
    socket.createChallenge(d.challenge.id, d.socketVersion, pingNow, {
      reload: reloadChallenge
    });
  }, err => {
    handleXhrError(err);
    m.route.set('/');
  })
  .catch(console.error.bind(console));

  vnode.state = {
    challenge,
    onunload() {
      socket.destroy();
      clearTimeout(pingTimeoutId);
      window.plugins.insomnia.allowSleepAgain();
    },
    joinChallenge() {
      return acceptChallenge(challenge().id)
      .run(() => challengesApi.remove(challenge().id))
      .run(d => m.route.set('/game' + d.url.round, null, true));
    },
    declineChallenge() {
      return declineChallenge(challenge().id)
      .run(() => challengesApi.remove(challenge().id))
      .run(backHistory);
    },
    cancelChallenge() {
      return cancelChallenge(challenge().id)
      .run(() => challengesApi.remove(challenge().id))
      .run(backHistory);
    }
  };
}
