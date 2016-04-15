import analyse from './analyse';
import treePath from './path';
import ground from './ground';
import promotion from '../shared/offlineRound/promotion';
import * as util from './util';
import sound from '../../sound';
import debounce from 'lodash/debounce';
import socket from '../../socket';
import cevalCtrl from './ceval/cevalCtrl';
import helper from '../helper';
import gameApi from '../../lichess/game';
import settings from '../../settings';
import continuePopup from '../shared/continuePopup';
import { handleXhrError, oppositeColor } from '../../utils';
import { getAnalyseData, getCurrentOTBGame, getCurrentAIGame } from '../../utils/offlineGames';
import { game as gameXhr } from '../../xhr';
import { makeData, makeDefaultData } from './data';
import notes from '../round/notes';
import chessLogic from './chessLogic';
import menu from './menu';
import m from 'mithril';

export default function controller() {
  this.source = m.route.param('source') || 'offline';
  const gameId = m.route.param('id');
  const orientation = m.route.param('color');
  const fen = m.route.param('fen');

  socket.createDefault();

  this.data = null;

  this.menu = menu.controller(this);
  this.continuePopup = continuePopup.controller();

  this.vm = {
    fromGame: gameId !== undefined,
    path: null,
    pathStr: '',
    initialPathStr: '',
    step: null,
    cgConfig: null,
    flip: false,
    variationMenu: null,
    showBestMove: settings.analyse.showBestMove(),
    replayHash: '',
    buttonsHash: '',
    infosHash: '',
    openingHash: ''
  };

  this.flip = function() {
    this.vm.flip = !this.vm.flip;
    this.chessground.set({
      orientation: this.vm.flip ? oppositeColor(this.data.orientation) : this.data.orientation
    });
  }.bind(this);

  function uciToLastMove(uci) {
    if (!uci) return null;
    if (uci[1] === '@') return [uci.substr(2, 2), uci.substr(2, 2)];
    return [uci.substr(0, 2), uci.substr(2, 2)];
  }

  this.startCeval = function() {
    if (this.ceval.enabled() && this.canUseCeval()) {
      this.ceval.start(this.vm.path, this.analyse.getSteps(this.vm.path));
    }
  }.bind(this);

  const debouncedStartCeval = debounce(this.startCeval, 500);
  const debouncedDests = debounce(getDests.bind(this), 100);

  const showGround = function() {
    var s;
    try {
      s = this.analyse.getStep(this.vm.path);
    } catch (e) {
      console.log(e);
    }
    if (!s) {
      this.vm.path = treePath.default(this.analyse.firstPly());
      this.vm.pathStr = treePath.write(this.vm.path);
      s = this.analyse.getStep(this.vm.path);
    }
    const initialColor = this.data.game.initialColor || 'white';
    const color = s.ply % 2 === 0 ? initialColor : oppositeColor(initialColor);
    const dests = util.readDests(s.dests);
    const config = {
      fen: s.fen,
      turnColor: color,
      orientation: this.vm.flip ? oppositeColor(this.data.orientation) : this.data.orientation,
      movable: {
        color: dests && Object.keys(dests).length > 0 ? color : null,
        dests: dests || {}
      },
      check: s.check,
      lastMove: uciToLastMove(s.uci)
    };
    this.vm.step = s;
    this.vm.cgConfig = config;
    if (!this.chessground)
      this.chessground = ground.make(this.data, config, userMove.bind(this), userNewPiece.bind(this));
    this.chessground.set(config);
    if (!dests) debouncedDests();
  }.bind(this);

  const debouncedScroll = debounce(() => util.autoScroll(document.getElementById('replay')), 200);

  this.jump = function(path, direction) {
    this.vm.path = path;
    this.vm.pathStr = treePath.write(path);
    this.toggleVariationMenu(null);
    showGround();
    if (this.vm.step && this.vm.step.san && direction === 'forward') {
      if (this.vm.step.san.indexOf('x') !== -1) sound.capture();
      else sound.move();
    }
    this.ceval.stop();
    debouncedStartCeval();
    debouncedScroll();
    promotion.cancel(this, this.vm.cgConfig);
  }.bind(this);

  this.userJump = function(path, direction) {
    this.jump(path, direction);
  }.bind(this);

  this.jumpToMain = function(ply) {
    this.userJump([{
      ply: ply,
      variation: null
    }]);
  }.bind(this);

  this.jumpToIndex = function(index) {
    this.jumpToMain(index + 1 + this.data.game.startedAtTurn);
  }.bind(this);

  this.jumpToNag = function(color, nag) {
    var ply = this.analyse.plyOfNextNag(color, nag, this.vm.step.ply);
    if (ply) this.jumpToMain(ply);
    m.redraw();
  }.bind(this);

  function userNewPiece() {
    this.jump(this.vm.path);
  }

  const preparePremoving = function() {
    this.chessground.set({
      turnColor: this.chessground.data.movable.color,
      movable: {
        color: oppositeColor(this.chessground.data.movable.color)
      }
    });
  }.bind(this);

  const sendMove = function(orig, dest, prom) {
    const move = {
      orig: orig,
      dest: dest,
      variant: this.data.game.variant.key,
      fen: this.vm.step.fen,
      path: this.vm.pathStr,
      ply: this.vm.step.ply
    };
    if (prom) move.promotion = prom;
    this.chessLogic.sendStepRequest(move);
    preparePremoving();
  }.bind(this);

  function userMove(orig, dest, capture) {
    this.vm.justPlayed = orig + dest;
    sound[capture ? 'capture' : 'move']();
    if (!promotion.start(this, orig, dest, sendMove)) sendMove(orig, dest);
  }

  this.addStep = function(step, path) {
    const newPath = this.analyse.addStep(step, treePath.read(path));
    this.jump(newPath);
    m.redraw();
    this.chessground.playPremove();
  }.bind(this);

  this.addDests = function(dests, path) {
    this.analyse.addDests(dests, treePath.read(path));
    if (path === this.vm.pathStr) {
      showGround();
      m.redraw();
      if (dests === '') this.ceval.stop();
    }
    this.chessground.playPremove();
  }.bind(this);

  this.toggleVariationMenu = function(path) {
    if (!path) this.vm.variationMenu = null;
    else {
      var key = treePath.write(path.slice(0, 1));
      this.vm.variationMenu = this.vm.variationMenu === key ? null : key;
    }
  }.bind(this);

  this.deleteVariation = function(path) {
    var ply = path[0].ply;
    var id = path[0].variation;
    this.analyse.deleteVariation(ply, id);
    if (treePath.contains(path, this.vm.path)) this.jumpToMain(ply - 1);
    this.toggleVariationMenu(null);
  }.bind(this);

  this.promoteVariation = function(path) {
    var ply = path[0].ply;
    var id = path[0].variation;
    this.analyse.promoteVariation(ply, id);
    if (treePath.contains(path, this.vm.path))
      this.jump(this.vm.path.splice(1));
    this.toggleVariationMenu(null);
  }.bind(this);

  this.reset = function() {
    this.chessground.set(this.vm.situation);
    m.redraw();
  }.bind(this);

  this.encodeStepFen = function() {
    return this.vm.step.fen.replace(/\s/g, '_');
  }.bind(this);

  this.currentAnyEval = function() {
    return this.vm.step ? (this.vm.step.oEval || this.vm.step.ceval) : null;
  }.bind(this);

  const allowCeval = function() {
    return (
      this.source === 'offline' || util.isSynthetic(this.data) || !gameApi.playable(this.data)
    ) && ['standard', 'chess960', 'fromPosition'].indexOf(this.data.game.variant.key) !== -1;
  }.bind(this);

  function onCevalMsg(res) {
    this.analyse.updateAtPath(res.work.path, function(step) {
      if (step.ceval && step.ceval.depth >= res.ceval.depth) return;
      step.ceval = res.ceval;
      this.chessLogic.getSanMoveFromUci({
        fen: step.fen,
        orig: res.ceval.best.slice(0, 2),
        dest: res.ceval.best.slice(2, 4)
      }, data => {
        step.ceval.bestSan = data.situation.pgnMoves[0];
        if (treePath.write(res.work.path) === this.vm.pathStr) {
          m.redraw();
        }
      });
    }.bind(this));
  }

  this.canUseCeval = function() {
    return this.vm.step.dests !== '' && (!this.vm.step.oEval || !this.analyse.nextStepEvalBest(this.vm.path));
  }.bind(this);

  this.nextStepBest = function() {
    return this.analyse.nextStepEvalBest(this.vm.path);
  }.bind(this);

  this.hasAnyComputerAnalysis = function() {
    return this.data.analysis || this.ceval.enabled();
  };

  this.toggleBestMove = function() {
    this.vm.showBestMove = !this.vm.showBestMove;
  }.bind(this);

  this.onunload = function() {
    window.plugins.insomnia.allowSleepAgain();
    if (this.ceval) this.ceval.destroy();
    if (this.chessLogic) this.chessLogic.onunload();
  }.bind(this);

  const init = function(data) {
    this.data = data;
    if (settings.analyse.supportedVariants.indexOf(this.data.game.variant.key) === -1) {
      window.plugins.toast.show(`Analysis board does not support ${this.data.game.variant.name} variant.`, 'short', 'center');
      m.route('/');
    }
    if (!data.game.moveTimes) this.data.game.moveTimes = [];
    this.ongoing = !util.isSynthetic(this.data) && gameApi.playable(this.data);
    this.chessLogic = new chessLogic(this);
    this.analyse = new analyse(this.data.steps);
    this.ceval = cevalCtrl(this.data.game.variant.key, allowCeval(), onCevalMsg.bind(this));
    this.notes = this.data.game.speed === 'correspondence' ? new notes.controller(this) : null;

    var initialPath = treePath.default(this.analyse.firstPly());
    if (initialPath[0].ply >= this.data.steps.length) {
      initialPath = treePath.default(this.data.steps.length - 1);
    }

    this.vm.path = initialPath;
    this.vm.pathStr = treePath.write(initialPath);

    showGround();
    this.startCeval();
  }.bind(this);

  this.startNewAnalysis = function() {
    init(makeDefaultData());
  };

  if (this.source === 'online' && gameId) {
    gameXhr(gameId, orientation, false).then(function(cfg) {
      helper.analyticsTrackView('Analysis (online game)');
      init(makeData(cfg));
      m.redraw();
    }, err => {
      handleXhrError(err);
      m.route('/');
    });
  } else if (this.source === 'offline' && gameId === 'otb') {
    helper.analyticsTrackView('Analysis (offline otb)');
    const otbData = getAnalyseData(getCurrentOTBGame());
    if (!otbData) {
      m.route('/analyse');
    } else {
      otbData.player.spectator = true;
      otbData.orientation = orientation;
      init(makeData(otbData));
    }
  } else if (this.source === 'offline' && gameId === 'ai') {
    helper.analyticsTrackView('Analysis (offline ai)');
    const aiData = getAnalyseData(getCurrentAIGame());
    if (!aiData) {
      m.route('/analyse');
    } else {
      aiData.player.spectator = true;
      aiData.orientation = orientation;
      init(makeData(aiData));
    }
  }
  else {
    helper.analyticsTrackView('Analysis (empty)');
    init(makeDefaultData(fen));
  }

  window.plugins.insomnia.keepAwake();

}

function getDests() {
  if (!this.vm.step.dests) {
    this.chessLogic.sendDestsRequest({
      variant: this.data.game.variant.key,
      fen: this.vm.step.fen,
      path: this.vm.pathStr
    });
  }
}
