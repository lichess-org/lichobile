import { handleXhrError, backHistory } from '../../utils';
import { acceptChallenge, cancelChallenge, getChallenge } from '../../xhr';
import socket from '../../socket';
import m from 'mithril';

export default function controller() {
  const data = m.prop();

  function reloadChallenge() {
    getChallenge(data().challenge.id).then(data, err => {
      handleXhrError(err);
      m.route('/');
    });
  }

  getChallenge(m.route.param('id')).then(d => {
    data(d);
    socket.createChallenge(d.challenge.id, d.socketVersion, {
      reload: reloadChallenge
    });
  }, err => {
    handleXhrError(err);
    m.route('/');
  });

  return {
    data,
    onunload: function() {
      socket.destroy();
      window.plugins.insomnia.allowSleepAgain();
    },
    joinChallenge: id => acceptChallenge(id).then(d =>
      m.route('/game' + d.url.round)
    ),
    cancelChallenge: () => {
      cancelChallenge(data().challenge.id);
      backHistory();
    }
  };
}
