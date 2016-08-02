import oninit from './tournamentDetailCtrl';
import view from './tournamentDetailView';

export default {
  oninit,
  onremove() {
    clearInterval(this.clockInterval());
  },
  view
};
