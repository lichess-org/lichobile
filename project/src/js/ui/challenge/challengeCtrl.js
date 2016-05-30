import { handleXhrError, backHistory } from '../../utils';
import throttle from 'lodash/throttle';
import { acceptChallenge, declineChallenge, cancelChallenge, getChallenge } from '../../xhr';
import challengesApi from '../../lichess/challenges';
import i18n from '../../i18n';
import socket from '../../socket';
import m from 'mithril';

const throttledPing = throttle(() => socket.send('ping'), 1000);

export default function controller() {
  var pingTimeoutId;
  const challenge = m.prop();

  function reloadChallenge() {
    getChallenge(challenge().id).then(d => {
      clearTimeout(pingTimeoutId);
      challenge(d.challenge);
      switch (d.challenge.status) {
        case 'accepted':
          m.route(`/game/${d.challenge.id}`);
          break;
        case 'declined':
          window.plugins.toast.show(i18n('challengeDeclined'), 'short', 'center');
          backHistory();
          break;
      }
    }, err => {
      clearTimeout(pingTimeoutId);
      handleXhrError(err);
      m.route('/');
    });
  }

  function pingNow() {
    throttledPing();
    pingTimeoutId = setTimeout(pingNow, 2000);
  }

  getChallenge(m.route.param('id')).then(d => {
    challenge(d.challenge);
    socket.createChallenge(d.challenge.id, d.socketVersion, pingNow, {
      reload: reloadChallenge
    });
  }, err => {
    handleXhrError(err);
    m.route('/');
  })
  .catch(console.error.bind(console));

  return {
    challenge,
    onunload() {
      socket.destroy();
      clearTimeout(pingTimeoutId);
      window.plugins.insomnia.allowSleepAgain();
    },
    joinChallenge() {
      return acceptChallenge(challenge().id)
      .then(() => challengesApi.remove(challenge().id))
      .then(d => m.route('/game' + d.url.round));
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
