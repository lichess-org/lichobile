import gameStatusApi from '../../lichess/status';
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
import newGameMenu from './newAiGame';
import { askWorker, getRandomArbitrary, oppositeColor } from '../../utils';
import { setCurrentAIGame, getCurrentAIGame } from '../../utils/offlineGames';
import i18n from '../../i18n';
import socket from '../../socket';
import m from 'mithril';

export const storageFenKey = 'ai.setupFen';

export default function controller() {

  helper.analyticsTrackView('Offline AI');

  socket.createDefault();

  const chessWorker = new Worker('vendor/scalachessjs.js');
  const engine = engineCtrl(this);
  this.actions = new actions.controller(this);
  this.newGameMenu = new newGameMenu.controller(this);

  this.vm = {
    engineSearching: false
  };

  this.save = function() {
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
    const name = settings.ai.availableOpponents.find(e => e[1] === level)[0];
    return {
      name: i18n('aiNameLevelAiLevel', name, level),
      level: parseInt(level) || 1
    };
  };

  this.onEngineBestMove = function(bestmove) {
    const from = bestmove.slice(0, 2);
    const to = bestmove.slice(2, 4);
    this.vm.engineSearching = false;
    this.chessground.apiMove(from, to);
    addMove(from, to);
  };

  const engineMove = function () {
    this.vm.engineSearching = true;
    const sit = this.replay.situation();
    setTimeout(() => {
      engine.setLevel(this.getOpponent().level);
      engine.search(this.data.game.initialFen, sit.uciMoves.join(' '));
    }, 500);
  }.bind(this);

  const isEngineToMove = function() {
    const sit = this.replay.situation();
    return !sit.end && sit.player !== this.data.player.color;
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
    const sit = this.replay.situation();
    setResult(this, sit.status);
    if (gameStatusApi.finished(this.data)) {
      this.onGameEnd();
    } else if (isEngineToMove()) {
      engineMove();
      m.redraw();
    }
    this.save();
    m.redraw();
  }.bind(this);

  this.onGameEnd = function() {
    const self = this;
    this.chessground.cancelMove();
    this.chessground.stop();
    setTimeout(function() {
      self.actions.open();
      m.redraw();
    }, 500);
  }.bind(this);

  this.resign = function() {
    setResult(this, { id: 31, name: 'resign' }, oppositeColor(this.data.player.color));
    this.save();
    this.onGameEnd();
  }.bind(this);

  this.init = function(data, situations, ply) {
    this.newGameMenu.close();
    this.actions.close();
    this.data = data;

    if (!this.chessground) {
      this.chessground = ground.make(this.data, this.data.game.fen, userMove, onMove);
    } else {
      ground.reload(this.chessground, this.data, this.data.game.fen);
    }

    if (!this.replay) {
      this.replay = new replayCtrl(this, situations, ply, chessWorker);
    } else {
      this.replay.init(situations, ply);
    }
    this.replay.apply();

    engine.prepare(this.data.game.variant.key);
    if (isEngineToMove()) {
      engineMove();
    }

    m.redraw();
  }.bind(this);

  this.startNewGame = function(setupFen) {
    const variant = settings.ai.variant();
    helper.analyticsTrackEvent('Offline Game', `New game ${variant}`);

    askWorker(chessWorker, {
      topic: 'init',
      payload: {
        variant,
        fen: setupFen || undefined
      }
    }).then(data => {
      this.init(makeData({
        variant: data.variant,
        initialFen: data.setup.fen,
        fen: data.setup.fen,
        color: getColorFromSettings()
      }), [data.setup], 0);
      if (setupFen) {
        storage.remove(storageFenKey);
      }
    });
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

  engine.init(() => {
    if (saved) {
      try {
        this.init(saved.data, saved.situations, saved.ply);
      } catch (e) {
        console.log(e, 'Fail to load saved game');
        this.startNewGame();
      }
    } else if (setupFen) {
      this.startNewGame(setupFen);
    } else {
      this.startNewGame();
    }
  });

  window.plugins.insomnia.keepAwake();

  this.onunload = function() {
    window.plugins.insomnia.allowSleepAgain();
    if (this.chessground) {
      this.chessground.onunload();
    }
    chessWorker.terminate();
    engine.exit();
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
