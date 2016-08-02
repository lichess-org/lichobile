import router from '../../router';
import { handleXhrError, backHistory } from '../../utils';
import throttle from 'lodash/throttle';
import { acceptChallenge, declineChallenge, cancelChallenge, getChallenge } from '../../xhr';
import challengesApi from '../../lichess/challenges';
import i18n from '../../i18n';
import socket from '../../socket';
import m from 'mithril';

const throttledPing = throttle(() => socket.send('ping'), 1000);

export default function oninit(vnode) {
  const pingTimeoutId = m.prop();
  const challenge = m.prop();

  function reloadChallenge() {
    getChallenge(challenge().id)
    .run(d => {
      clearTimeout(pingTimeoutId());
      challenge(d.challenge);
      switch (d.challenge.status) {
        case 'accepted':
          router.set(`/game/${d.challenge.id}`, null, { replace: true});
          break;
        case 'declined':
          window.plugins.toast.show(i18n('challengeDeclined'), 'short', 'center');
          backHistory();
          break;
      }
    })
    .catch(err => {
      clearTimeout(pingTimeoutId());
      handleXhrError(err);
      router.set('/');
    });
  }

  function pingNow() {
    throttledPing();
    pingTimeoutId(setTimeout(pingNow, 2000));
  }

  getChallenge(vnode.attrs.id).run(d => {
    challenge(d.challenge);
    socket.createChallenge(d.challenge.id, d.socketVersion, pingNow, {
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
      .run(() => challengesApi.remove(challenge().id))
      .run(d => router.set('/game' + d.url.round, null, { replace: true }));
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
