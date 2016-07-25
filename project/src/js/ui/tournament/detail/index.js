import socket from '../../../socket';
import oninit from './tournamentDetailCtrl';
import view from './tournamentDetailView';

export default {
  oninit,
  onremove() {
    socket.destroy();
    clearInterval(this.clockInterval());
  },
  view
};
