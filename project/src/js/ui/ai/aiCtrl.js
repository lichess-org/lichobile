import gameStatusApi from '../../lichess/status';
import redraw from '../../utils/redraw';
import promotion from '../shared/offlineRound/promotion';
import ground from '../shared/offlineRound/ground';
import makeData from '../shared/offlineRound/data';
import { setResult } from '../shared/offlineRound';
import sound from '../../sound';
import atomic from '../round/atomic';
import vibrate from '../../vibrate';
import replayCtrl from '../shared/offlineRound/replayCtrl';
import storage from '../../storage';
import settings from '../../settings';
import actions from './actions';
import engineCtrl from './engine';
import helper from '../helper';
import newGameMenu from './newAiGame';
import { askWorker, getRandomArbitrary, oppositeColor, aiName, noop } from '../../utils';
import { setCurrentAIGame, getCurrentAIGame } from '../../utils/offlineGames';
import i18n from '../../i18n';
import socket from '../../socket';

export const storageFenKey = 'ai.setupFen';

export default function oninit() {

  helper.analyticsTrackView('Offline AI');

  socket.createDefault();

  this.engine = engineCtrl(this);
  this.chessWorker = new Worker('vendor/scalachessjs.js');
  this.actions = actions.controller(this);
  this.newGameMenu = newGameMenu.controller(this);

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

  this.playerName = function() {
    return i18n(this.data.player.color);
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
    redraw();
  };

  const engineMove = function () {
    this.vm.engineSearching = true;
    const sit = this.replay.situation();
    setTimeout(() => {
      const l = this.getOpponent().level;
      this.data.opponent.username = aiName(l);
      this.engine.setLevel(l)
      .then(() => this.engine.search(this.data.game.initialFen, sit.uciMoves.join(' ')));
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
    if (capturedPiece) {
      if (this.data.game.variant.key === 'atomic') {
        atomic.capture(this.chessground, dest);
        sound.explosion();
      }
      else sound.capture();
    } else {
      sound.move();
    }
    vibrate.quick();
  }.bind(this);

  this.onReplayAdded = function() {
    const sit = this.replay.situation();
    setResult(this, sit.status);
    if (gameStatusApi.finished(this.data)) {
      this.onGameEnd();
    } else if (isEngineToMove()) {
      engineMove();
    }
    this.save();
    redraw();
  }.bind(this);

  this.onGameEnd = function() {
    const self = this;
    this.chessground.cancelMove();
    this.chessground.stop();
    setTimeout(function() {
      self.actions.open();
      redraw();
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

    if (!this.replay) {
      this.replay = new replayCtrl(this, situations, ply, this.chessWorker);
    } else {
      this.replay.init(situations, ply);
    }

    if (!this.chessground) {
      this.chessground = ground.make(this.data, this.replay.situation(), userMove, noop, onMove, noop);
    } else {
      ground.reload(this.chessground, this.data, this.replay.situation());
    }

    this.engine.prepare(this.data.game.variant.key)
    .then(() => {
      if (isEngineToMove()) {
        engineMove();
      }
    });

    redraw();
  }.bind(this);

  this.startNewGame = function(setupFen) {
    const variant = settings.ai.variant();
    helper.analyticsTrackEvent('Offline Game', `New game ${variant}`);

    askWorker(this.chessWorker, {
      topic: 'init',
      payload: {
        variant,
        fen: setupFen || undefined
      }
    })
    .then(data => {
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
    const ply = this.replay.ply;
    this.jump(ply + (ply + 2 >= this.replay.situations.length ? 1 : 2));
  }.bind(this);

  this.backward = function() {
    const ply = this.replay.ply;
    if (this.data.player.color === 'black') {
      const offset = ply % 2 === 0 ? 1 : 2;
      this.jump(ply - offset);
    } else {
      const offset = ply % 2 === 0 ? 2 : 1;
      this.jump(ply - offset);
    }
  }.bind(this);

  this.firstPly = function () {
    return this.data.player.color === 'black' ? 1 : 0;
  }.bind(this);

  const saved = getCurrentAIGame();
  const setupFen = storage.get(storageFenKey);

  this.engine.init()
  .then(() => {
    if (setupFen) {
      this.startNewGame(setupFen);
    } else if (saved) {
      try {
        this.init(saved.data, saved.situations, saved.ply);
      } catch (e) {
        console.log(e, 'Fail to load saved game');
        this.startNewGame();
      }
    } else {
      this.startNewGame();
    }
  });

  window.plugins.insomnia.keepAwake();
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
