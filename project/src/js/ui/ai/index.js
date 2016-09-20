import socket from '../../socket';
import { getCurrentAIGame } from '../../utils/offlineGames';
import * as helper from '../helper';
import view from './aiView';
import AiRound from './AiRound';

export const storageFenKey = 'ai.setupFen';

export default {
  oninit({ attrs }) {
    helper.analyticsTrackView('Offline AI');

    socket.createDefault();

    const saved = getCurrentAIGame();
    const setupFen = attrs.fen;

    this.round = new AiRound(saved, setupFen);

    window.plugins.insomnia.keepAwake();
  },
  oncreate: helper.viewFadeIn,
  onremove() {
    window.plugins.insomnia.allowSleepAgain();
    this.round.engine.exit();
  },
  view
};
