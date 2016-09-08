import router from '../../router';
import redraw from '../../utils/redraw';
import socket from '../../socket';
import { handleXhrError } from '../../utils';
import { game as gameXhr } from '../../xhr';
import { getAnalyseData, getCurrentAIGame, getCurrentOTBGame } from '../../utils/offlineGames';
import * as helper from '../helper';
import { makeData, makeDefaultData } from './data';
import AnalyseCtrl from './AnalyseCtrl';

export default function oninit(vnode) {
  const source = vnode.attrs.source || 'offline';
  const gameId = vnode.attrs.id;
  const orientation = vnode.attrs.color;
  const fenArg = vnode.attrs.fen;

  socket.createDefault();
  window.plugins.insomnia.keepAwake();

  if (source === 'online' && gameId) {
    gameXhr(gameId, orientation)
    .then(cfg => {
      helper.analyticsTrackView('Analysis (online game)');
      cfg.orientation = orientation;
      this.ctrl = new AnalyseCtrl(makeData(cfg), source);
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
      otbData.orientation = orientation;
      this.ctrl = new AnalyseCtrl(makeData(otbData), source);
    }
  } else if (source === 'offline' && gameId === 'ai') {
    helper.analyticsTrackView('Analysis (offline ai)');
    const aiData = getAnalyseData(getCurrentAIGame());
    if (!aiData) {
      router.set('/analyse');
    } else {
      aiData.player.spectator = true;
      aiData.orientation = orientation;
      this.ctrl = new AnalyseCtrl(makeData(aiData), source);
    }
  }
  else {
    helper.analyticsTrackView('Analysis (empty)');
    this.ctrl = new AnalyseCtrl(makeDefaultData(fenArg, orientation), source);
  }

}
