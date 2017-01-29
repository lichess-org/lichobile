import socket from '../../socket';
import { getCurrentAIGame } from '../../utils/offlineGames';
import * as helper from '../helper';
import view from './aiView';
import AiRound from './AiRound';

interface Attrs {
  fen?: string
}

interface State {
  round: AiRound
}

const AiScreen: Mithril.Component<Attrs, State> = {
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
    if (this.round) this.round.engine.exit();
  },
  view
};

export default AiScreen
