import socket from '../../socket';
import * as helper from '../helper';
import oninit from './challengeCtrl';
import view from './challengeView';

export default {
  oninit,
  oncreate: helper.viewFadeIn,
  onremove() {
    socket.destroy();
    window.plugins.insomnia.allowSleepAgain();
    clearTimeout(this.pingTimeoutId());
  },
  view
};
