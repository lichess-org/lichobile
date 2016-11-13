import socket from '../../socket';
import * as helper from '../helper';
import { getCurrentOTBGame } from '../../utils/offlineGames';
import OtbRound from './OtbRound';
import view from './otbView';

interface Attrs {
  fen?: string
}

interface State {
  round: OtbRound
}

const OtbScreen: Mithril.Component<Attrs, State> = {
  oninit({ attrs }) {
    helper.analyticsTrackView('Offline On The Board');

    socket.createDefault();

    const saved = getCurrentOTBGame();
    const setupFen = attrs.fen;

    this.round = new OtbRound(saved, setupFen);

    window.plugins.insomnia.keepAwake();
  },
  oncreate: helper.viewFadeIn,
  onremove() {
    window.plugins.insomnia.allowSleepAgain();
  },
  view
}

export default OtbScreen
