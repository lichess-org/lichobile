import socket from '../../socket';
import { getCurrentAIGame } from '../../utils/offlineGames';
import * as helper from '../helper';
import { playerFromFen } from '../../utils/fen';
import i18n from '../../i18n';
import layout from '../layout';
import { gameTitle, header as renderHeader, viewOnlyBoardContent } from '../shared/common';

import { overlay, renderContent } from './aiView';
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
  view() {
    let content: () => Mithril.Children, header: () => Mithril.Children

    if (this.round.data && this.round.chessground) {
      header = () => renderHeader(gameTitle(this.round.data));
      content = () => renderContent(this.round);
    } else {
      const fen = this.round.vm.setupFen || this.round.vm.savedFen;
      const color = playerFromFen(fen);
      header = () => renderHeader(i18n('playOfflineComputer'));
      content = () => viewOnlyBoardContent(fen, undefined, color);
    }

    return layout.board(
      header,
      content,
      () => overlay(this.round)
    );
  }
};

export default AiScreen
