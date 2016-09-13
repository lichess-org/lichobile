import socket from '../../socket';
import storage from '../../storage';
import { getCurrentAIGame } from '../../utils/offlineGames';
import * as helper from '../helper';
import view from './aiView';
import AiRound from './AiRound';

export const storageFenKey = 'ai.setupFen';

export default {
  oninit() {
    helper.analyticsTrackView('Offline AI');

    socket.createDefault();

    const saved = getCurrentAIGame();
    const setupFen = storage.get(storageFenKey);

    this.round = new AiRound(saved, setupFen);

    window.plugins.insomnia.keepAwake();
  },
  oncreate: helper.viewFadeIn,
  onremove() {
    window.plugins.insomnia.allowSleepAgain();
    this.round.chessWorker.terminate();
    this.round.engine.exit();
  },
  view
};
