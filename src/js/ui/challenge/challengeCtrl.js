import router from '../../router';
import { handleXhrError, backHistory } from '../../utils';
import { throttle } from 'lodash/function';
import { acceptChallenge, declineChallenge, cancelChallenge, getChallenge } from '../../xhr';
import challengesApi from '../../lichess/challenges';
import i18n from '../../i18n';
import socket from '../../socket';
import * as m from 'mithril';

const throttledPing = throttle(() => socket.send('ping'), 1000);

export default function oninit(vnode) {
  const pingTimeoutId = m.prop();
  const challenge = m.prop();

  window.plugins.insomnia.keepAwake();

  function reloadChallenge() {
    getChallenge(challenge().id)
    .then(d => {
      challenge(d.challenge);
      switch (d.challenge.status) {
        case 'accepted':
          router.set(`/game/${d.challenge.id}`, true);
          break;
        case 'declined':
          window.plugins.toast.show(i18n('challengeDeclined'), 'short', 'center');
          backHistory();
          break;
      }
    });
  }

  function pingNow() {
    throttledPing();
    pingTimeoutId(setTimeout(pingNow, 2000));
  }

  function onSocketOpen() {
    // reload on open in case the reload msg has not been received
    reloadChallenge();
    pingNow();
  }

  getChallenge(vnode.attrs.id).then(d => {
    challenge(d.challenge);
    socket.createChallenge(d.challenge.id, d.socketVersion, onSocketOpen, {
      reload: reloadChallenge
    });
  })
  .catch(err => {
    handleXhrError(err);
    router.set('/');
  });

  vnode.state = {
    pingTimeoutId,
    challenge,
    joinChallenge() {
      return acceptChallenge(challenge().id)
      .then(() => challengesApi.remove(challenge().id))
      .then(d => router.set('/game' + d.url.round, true));
    },
    declineChallenge() {
      return declineChallenge(challenge().id)
      .then(() => challengesApi.remove(challenge().id))
      .then(backHistory);
    },
    cancelChallenge() {
      return cancelChallenge(challenge().id)
      .then(() => challengesApi.remove(challenge().id))
      .then(backHistory);
    }
  };
}
