import socket from '../../socket';
import helper from '../helper';
import storage from '../../storage';
import { getCurrentOTBGame } from '../../utils/offlineGames';
import OtbRound from './OtbRound';
import view from './otbView';

export const storageFenKey = 'otb.setupFen';

export default {
  oninit() {
    helper.analyticsTrackView('Offline On The Board');

    socket.createDefault();

    const saved = getCurrentOTBGame();
    const setupFen = storage.get(storageFenKey);

    this.round = new OtbRound(saved, setupFen);

    window.plugins.insomnia.keepAwake();
  },
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.onPageLeave(
    helper.viewFadeOut,
    () => window.plugins.insomnia.allowSleepAgain()
  ),
  onremove() {
    this.round.chessWorker.terminate();
  },
  view
};
