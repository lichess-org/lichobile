import gameStatusApi from '../../lichess/status';
import promotion from '../shared/offlineRound/promotion';
import ground from '../shared/offlineRound/ground';
import makeData from '../shared/offlineRound/data';
import { setResult } from '../shared/offlineRound';
import sound from '../../sound';
import vibrate from '../../vibrate';
import replayCtrl from '../shared/offlineRound/replayCtrl';
import storage from '../../storage';
import settings from '../../settings';
import actions from './actions';
import engineCtrl from './engine';
import helper from '../helper';
import newGameMenu from './newAiGame';
import { askWorker, getRandomArbitrary, oppositeColor, aiName } from '../../utils';
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
    m.redraw();
  };

  const engineMove = function () {
    this.vm.engineSearching = true;
    const sit = this.replay.situation();
    setTimeout(() => {
      const l = this.getOpponent().level;
      this.data.opponent.username = aiName(l);
      engine.setLevel(l)
      .then(() => engine.search(this.data.game.initialFen, sit.uciMoves.join(' ')));
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
    if (!capturedPiece) sound.move();
    else sound.capture();

    vibrate.quick();
  };

  this.onReplayAdded = function() {
    const sit = this.replay.situation();
    setResult(this, sit.status);
    if (gameStatusApi.finished(this.data)) {
      this.onGameEnd();
    } else if (isEngineToMove()) {
      engineMove();
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

    engine.prepare(this.data.game.variant.key)
    .then(() => {
      if (isEngineToMove()) {
        engineMove();
      }
    });

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

  engine.init()
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

  this.onunload = function() {
    window.plugins.insomnia.allowSleepAgain();
    if (this.chessground) {
      this.chessground.onunload();
    }
    if (chessWorker) chessWorker.terminate();
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
