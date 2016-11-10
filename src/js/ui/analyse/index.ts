import socket from '../../socket';
import { viewOnlyBoard, renderContent, overlay } from './view/analyseView';
import router from '../../router';
import redraw from '../../utils/redraw';
import { handleXhrError } from '../../utils';
import { game as gameXhr } from '../../xhr';
import i18n from '../../i18n';
import { getAnalyseData, getCurrentAIGame, getCurrentOTBGame } from '../../utils/offlineGames';
import * as helper from '../helper';
import { makeDefaultData } from './data';
import AnalyseCtrl from './AnalyseCtrl';
import { Source } from './interfaces';
import { gameTitle, connectingHeader, header, backButton as renderBackbutton } from '../shared/common';
import layout from '../layout';

export interface Attrs {
  id: string;
  source: Source;
  color: Color;
  fen?: string;
}

export interface State {
  ctrl?: AnalyseCtrl
}

const AnalyseScreen: Mithril.Component<Attrs, State> = {

  oninit(vnode) {
    const source = vnode.attrs.source || 'offline';
    const gameId = vnode.attrs.id;
    const orientation: Color = vnode.attrs.color || 'white';
    const fenArg = vnode.attrs.fen;

    socket.createDefault();
    window.plugins.insomnia.keepAwake();

    const shouldGoBack = gameId !== undefined || fenArg !== undefined;

    if (source === 'online' && gameId) {
      gameXhr(gameId, orientation)
      .then(cfg => {
        helper.analyticsTrackView('Analysis (online game)');
        this.ctrl = new AnalyseCtrl(cfg, source, orientation, shouldGoBack);
        redraw();
        setTimeout(this.ctrl.debouncedScroll, 250);
      })
      .catch(err => {
        handleXhrError(err);
        router.set('/');
      });
    } else if (source === 'offline' && gameId === 'otb') {
      helper.analyticsTrackView('Analysis (offline otb)');
      const otbData = getAnalyseData(getCurrentOTBGame());
      if (!otbData) {
        router.set('/analyse');
      } else {
        otbData.player.spectator = true;
        this.ctrl = new AnalyseCtrl(otbData, source, orientation, shouldGoBack);
      }
    } else if (source === 'offline' && gameId === 'ai') {
      helper.analyticsTrackView('Analysis (offline ai)');
      const aiData = getAnalyseData(getCurrentAIGame());
      if (!aiData) {
        router.set('/analyse');
      } else {
        aiData.player.spectator = true;
        this.ctrl = new AnalyseCtrl(aiData, source, orientation, shouldGoBack);
      }
    }
    else {
      helper.analyticsTrackView('Analysis (empty)');
      this.ctrl = new AnalyseCtrl(makeDefaultData(fenArg), source, orientation, shouldGoBack);
    }
  },

  oncreate(vnode) {
    if (vnode.attrs.source) {
      helper.pageSlideIn(vnode.dom as HTMLElement);
    } else {
      helper.elFadeIn(vnode.dom as HTMLElement);
    }
  },

  onremove() {
    window.plugins.insomnia.allowSleepAgain();
    socket.destroy();
    if (this.ctrl) {
      if (this.ctrl.ceval) this.ctrl.ceval.destroy();
      this.ctrl = null;
    }
  },

  view(vnode) {
    const isPortrait = helper.isPortrait();
    const bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait, 'analyse');

    if (this.ctrl) {

      const backButton = this.ctrl.vm.shouldGoBack ? renderBackbutton(gameTitle(this.ctrl.data)) : null;
      const title = this.ctrl.vm.shouldGoBack ? null : i18n('analysis');

      return layout.board(
        () => header(title, backButton),
        () => renderContent(this.ctrl, isPortrait, bounds),
        () => overlay(this.ctrl)
      );
    } else {
      return layout.board(
        connectingHeader,
        viewOnlyBoard(vnode.attrs.color)
      );
    }
  }
};

export default AnalyseScreen
