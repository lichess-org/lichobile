import { handleXhrError, backHistory } from '../../utils';
import { acceptChallenge, cancelChallenge, getChallenge } from '../../xhr';
import i18n from '../../i18n';
import socket from '../../socket';
import m from 'mithril';

export default function controller() {
  var pingTimeoutId;
  const challenge = m.prop();

  function reloadChallenge() {
    getChallenge(challenge().id).then(d => {
      challenge(d.challenge);
      switch (d.challenge.status) {
        case 'accepted':
          // FIXME need to redirect with full id
          m.route(`/game/${d.challenge.id}`);
          break;
        case 'declined':
          window.plugins.toast.show(i18n('challengeDeclined'), 'short', 'center');
          backHistory();
          break;
      }
    }, err => {
      handleXhrError(err);
      m.route('/');
    });
  }

  function pingNow() {
    socket.send('ping');
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
  });

  return {
    challenge,
    onunload: function() {
      socket.destroy();
      clearTimeout(pingTimeoutId);
      window.plugins.insomnia.allowSleepAgain();
    },
    joinChallenge: id => acceptChallenge(id).then(d =>
      m.route('/game' + d.url.round)
    ),
    cancelChallenge: () => {
      cancelChallenge(challenge().id);
      backHistory();
    }
  };
}
