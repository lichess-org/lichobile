import router from '../../router';
import redraw from '../../utils/redraw';
import socket from '../../socket';
import { handleXhrError } from '../../utils';
import { game as gameXhr } from '../../xhr';
import { getAnalyseData, getCurrentAIGame, getCurrentOTBGame } from '../../utils/offlineGames';
import * as helper from '../helper';
import { makeDefaultData } from './data';
import AnalyseCtrl from './AnalyseCtrl';
import { Source } from './interfaces';

interface Attrs {
  id: string;
  source: Source;
  color: Color;
  fen?: string;
}

export default function oninit(vnode: Mithril.Vnode<Attrs>) {
  const source = vnode.attrs.source || 'offline';
  const gameId = vnode.attrs.id;
  const orientation: Color = vnode.attrs.color || 'white';
  const fenArg = vnode.attrs.fen;

  socket.createDefault();
  window.plugins.insomnia.keepAwake();

  const shouldGoBack = !!gameId;

  if (source === 'online' && gameId) {
    gameXhr(gameId, orientation)
    .then(cfg => {
      helper.analyticsTrackView('Analysis (online game)');
      cfg.orientation = orientation;
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
}
