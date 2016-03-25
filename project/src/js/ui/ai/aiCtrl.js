import promotion from '../shared/offlineRound/promotion';
import ground from '../shared/offlineRound/ground';
import makeData from '../shared/offlineRound/data';
import { setResult } from '../shared/offlineRound';
import sound from '../../sound';
import replayCtrl from '../shared/offlineRound/replayCtrl';
import storage from '../../storage';
import settings from '../../settings';
import actions from './actions';
import engineCtrl from './engine';
import helper from '../helper';
import { getRandomArbitrary } from '../../utils';
import { setCurrentAIGame, getCurrentAIGame } from '../../utils/offlineGames';
import m from 'mithril';

export const storageFenKey = 'ai.setupFen';

export default function controller() {
  helper.analyticsTrackView('Offline AI');

  const engine = engineCtrl(this);

  const save = function() {
    setCurrentAIGame({
      data: this.data,
      situations: this.replay.situations,
      ply: this.replay.ply
    });
  }.bind(this);

  const addMove = function(orig, dest, promotionRole) {
    this.replay.addMove(orig, dest, promotionRole);
  }.bind(this);

  this.getOpponent = function() {
    const level = settings.ai.opponent();
    return {
      name: settings.ai.availableOpponents.filter(function(o) {
        return o[1] === level;
      })[0][0],
      level: parseInt(level) || 1
    };
  };

  const engineMove = function () {
    engine.setLevel(this.getOpponent().level);
    engine.search(this.data.game.fen);
  }.bind(this);

  const isEngineToMove = function() {
    return this.chessground.data.turnColor !== this.data.player.color;
  }.bind(this);

  const onPromotion = function(orig, dest, role) {
    addMove(orig, dest, role);
  };

  const userMove = function(orig, dest) {
    if (!promotion.start(this, orig, dest, onPromotion)) {
      addMove(orig, dest);
    }
  }.bind(this);

  const onMove = function(orig, dest, capturedPiece) {
    if (!capturedPiece)
      sound.move();
    else
      sound.capture();
  };

  this.onReplayAdded = function() {
    this.data.game.fen = this.replay.situation().fen;
    save();
    m.redraw();
    if (this.replay.situation().finished) {
      setResult(this);
      this.chessground.cancelMove();
      this.chessground.stop();
      save();
      setTimeout(function() {
        this.actions.open();
        m.redraw();
      }.bind(this), 1000);
    } else if (isEngineToMove()) {
      engineMove();
    }
  }.bind(this);

  this.actions = new actions.controller(this);

  this.init = function(data, situations, ply) {
    this.data = data;
    if (!this.chessground) {
      this.chessground = ground.make(this.data, this.data.game.fen, userMove, onMove);
    } else {
      ground.reload(this.chessground, this.data, this.data.game.fen);
    }
    if (!this.replay) {
      this.replay = new replayCtrl(this, situations, ply);
    } else {
      this.replay.init(situations, ply);
    }
    this.replay.apply();
    if (this.actions) {
      this.actions.close();
    }
    if (isEngineToMove()) {
      engineMove();
    }
  }.bind(this);

  this.startNewGame = function() {
    const opts = {
      color: getColorFromSettings()
    };
    this.init(makeData(opts));
  }.bind(this);

  this.jump = function(ply) {
    this.chessground.cancelMove();
    if (this.replay.ply === ply || ply < 0 || ply >= this.replay.situations.length) return;
    this.replay.ply = ply;
    this.replay.apply();
  }.bind(this);

  this.forward = function() {
    this.jump(this.replay.ply + 2);
  }.bind(this);

  this.backward = function() {
    this.jump(this.replay.ply - 2);
  }.bind(this);

  this.firstPly = function () {
    return this.data.player.color === 'black' ? 1 : 0;
  }.bind(this);

  const saved = getCurrentAIGame();
  const setupFen = storage.get(storageFenKey);

  if (setupFen) {
    this.init(makeData({ fen: setupFen, color: getColorFromSettings() }));
    storage.remove(storageFenKey);
  } else if (saved) try {
    this.init(saved.data, saved.situations, saved.ply);
  } catch (e) {
    console.log(e, 'Fail to load saved game');
    this.init(makeData({}));
  } else this.init(makeData({}));

  this.onEngineSearch = function(bestmove) {
    const from = bestmove.slice(0, 2);
    const to = bestmove.slice(2, 4);
    this.chessground.apiMove(from, to);
    addMove(from, to);
  };

  window.plugins.insomnia.keepAwake();

  this.onunload = function() {
    window.plugins.insomnia.allowSleepAgain();
    if (this.chessground) {
      this.chessground.onunload();
    }
    if (this.replay) {
      this.replay.onunload();
    }
    engine.terminate();
  };
}

function getColorFromSettings() {
  let color = settings.ai.color();
  if (color === 'random') {
    if (getRandomArbitrary(0, 2) > 1)
      color = 'white';
    else
      color = 'black';
  }

  return color;
}
