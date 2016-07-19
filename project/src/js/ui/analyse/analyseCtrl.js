import m from 'mithril';
import debounce from 'lodash/debounce';
import session from '../../session';
import sound from '../../sound';
import signals from '../../signals';
import socket from '../../socket';
import gameApi from '../../lichess/game';
import settings from '../../settings';
import { handleXhrError, oppositeColor, noop, hasNetwork } from '../../utils';
import { getAnalyseData, getCurrentOTBGame, getCurrentAIGame } from '../../utils/offlineGames';
import { game as gameXhr } from '../../xhr';
import promotion from '../shared/offlineRound/promotion';
import continuePopup from '../shared/continuePopup';
import helper from '../helper';
import notes from '../round/notes';
import { getPGN } from '../round/roundXhr';
import importPgnPopup from './importPgnPopup.js';
import { makeData, makeDefaultData } from './data';
import chessLogic from './chessLogic';
import * as util from './util';
import { renderStepsTxt } from './pgnExport';
import cevalCtrl from './ceval/cevalCtrl';
import crazyValid from './crazy/crazyValid';
import explorerCtrl from './explorer/explorerCtrl';
import menu from './menu';
import evalSummary from './evalSummaryPopup';
import analyseSettings from './analyseSettings';
import analyse from './analyse';
import treePath from './path';
import ground from './ground';
import socketHandler from './analyseSocketHandler';

export default function controller() {
  this.source = m.route.param('source') || 'offline';
  const gameId = m.route.param('id');
  const orientation = m.route.param('color');
  const fenArg = m.route.param('fen');

  socket.createDefault();

  this.data = null;

  this.chessLogic = chessLogic(this);
  this.settings = analyseSettings.controller(this);
  this.menu = menu.controller(this);
  this.continuePopup = continuePopup.controller();
  this.importPgnPopup = importPgnPopup.controller(this);

  this.vm = {
    shouldGoBack: gameId !== undefined || fenArg !== undefined,
    path: null,
    pathStr: '',
    step: null,
    cgConfig: null,
    variationMenu: null,
    flip: false,
    analysisProgress: false,
    showBestMove: settings.analyse.showBestMove(),
    showComments: settings.analyse.showComments(),
    buttonsHash: '',
    evalBoxHash: '',
    gameInfosHash: '',
    opponentsHash: ''
  };

  this.resetHashes = function() {
    this.vm.buttonsHash = '';
    this.vm.evalBoxHash = '';
    this.vm.gameInfosHash = '';
    this.vm.opponentsHash = '';
  }.bind(this);

  const connectGameSocket = function() {
    if (hasNetwork()) {
      socket.createGame(
        this.data.url.socket,
        this.data.player.version,
        socketHandler(this, gameId, orientation),
        this.data.url.round
      );
    }
  }.bind(this);

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

  this.initCeval = function() {
    if (this.ceval.enabled()) {
      if (this.ceval.isInit()) {
        this.startCeval();
      } else {
        this.ceval.init().then(this.startCeval);
      }
    }
  }.bind(this);

  this.startCeval = function() {
    if (this.ceval.enabled() && this.canUseCeval()) {
      this.ceval.start(this.vm.path, this.analyse.getSteps(this.vm.path));
    }
  }.bind(this);

  const debouncedStartCeval = debounce(this.startCeval, 500);
  const debouncedDests = debounce(getDests.bind(this), 100);

  const showGround = function() {
    let s = this.analyse.getStep(this.vm.path);
    // might happen to have no step, for exemple with a bad step number in location
    // hash
    if (!s) {
      this.vm.path = treePath.default(this.analyse.firstPly());
      this.vm.pathStr = treePath.write(this.vm.path);
      s = this.analyse.getStep(this.vm.path);
    }

    const color = s.ply % 2 === 0 ? 'white' : 'black';
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

    if (this.data.game.variant.key === 'threeCheck' && !s.checkCount) {
      s.checkCount = util.readCheckCount(s.fen);
    }

    this.vm.step = s;
    this.vm.cgConfig = config;

    if (!this.chessground) {
      this.chessground = ground.make(this.data, config, userMove.bind(this), userNewPiece.bind(this));
    }
    this.chessground.set(config);
    if (!dests) debouncedDests();
  }.bind(this);

  this.debouncedScroll = debounce(() => util.autoScroll(document.getElementById('replay')), 200);

  const updateHref = debounce(() => {
    window.history.replaceState(null, null, '#' + this.vm.step.ply);
  }, 750);

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
    this.explorer.setStep();
    updateHref();
    debouncedStartCeval();
    this.debouncedScroll();
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
    this.chessLogic.sendMoveRequest(move);
    preparePremoving();
  }.bind(this);

  const roleToSan = {
    pawn: 'P',
    knight: 'N',
    bishop: 'B',
    rook: 'R',
    queen: 'Q'
  };
  const sanToRole = {
    P: 'pawn',
    N: 'knight',
    B: 'bishop',
    R: 'rook',
    Q: 'queen'
  };

  function userMove(orig, dest, capture) {
    this.vm.justPlayed = orig + dest;
    sound[capture ? 'capture' : 'move']();
    if (!promotion.start(this, orig, dest, sendMove)) sendMove(orig, dest);
  }

  function userNewPiece (piece, pos) {
    if (crazyValid.drop(this.chessground, piece, pos, this.vm.step.drops)) {
      this.vm.justPlayed = roleToSan[piece.role] + '@' + pos;
      sound.move();
      const drop = {
        role: piece.role,
        pos: pos,
        variant: this.data.game.variant.key,
        fen: this.vm.step.fen,
        path: this.vm.pathStr
      };
      this.chessLogic.sendDropRequest(drop);
      preparePremoving();
    } else this.jump(this.vm.path);
  }

  this.explorerMove = function(uci) {
    const move = util.decomposeUci(uci);
    if (uci[1] === '@') {
      this.chessground.apiNewPiece({
        color: this.chessground.data.movable.color,
        role: sanToRole[uci[0]]
      }, move[1]);
    } else if (!move[2]) {
      sendMove(move[0], move[1]);
    }
    else {
      sendMove(move[0], move[1], sanToRole[move[2].toUpperCase()]);
    }
    this.explorer.loading(true);
  }.bind(this);

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
    if (!path) {
      this.vm.variationMenu = null;
    } else {
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

  this.currentAnyEval = function() {
    return this.vm.step ? (this.vm.step.rEval || this.vm.step.ceval) : null;
  }.bind(this);

  const allowCeval = function() {
    return (
      this.source === 'offline' || util.isSynthetic(this.data) || !gameApi.playable(this.data)
    ) && gameApi.analysableVariants.indexOf(this.data.game.variant.key) !== -1;
  }.bind(this);

  function onCevalMsg(res) {
    this.analyse.updateAtPath(res.work.path, step => {
      if (step.ceval && step.ceval.depth >= res.ceval.depth) return;
      step.ceval = res.ceval;
      // even if we don't need the san move this ensure correct arrows are
      // displayed
      this.chessLogic.getSanMoveFromUci({
        fen: step.fen,
        orig: res.ceval.best.slice(0, 2),
        dest: res.ceval.best.slice(2, 4)
      }).then(data => {
        step.ceval.bestSan = data.situation.pgnMoves[0];
        if (treePath.write(res.work.path) === this.vm.pathStr) {
          m.redraw();
        }
      })
      // we just ignore errors here
      // TODO should try to find a way to stop ceval msg after the position
      // has been changed
      .catch(noop);
    });
  }

  this.canUseCeval = function() {
    return this.vm.step.dests !== '' && (!this.vm.step.rEval ||
      !this.nextStepBest());
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

  this.toggleComments = function() {
    this.vm.showComments = !this.vm.showComments;
  }.bind(this);

  this.sharePGN = function() {
    if (this.source === 'online') {
      getPGN(this.data.game.id)
      .then(pgn => window.plugins.socialsharing.share(pgn))
      .catch(handleXhrError);
    } else if (this.source === 'offline' && gameId !== undefined) {
      this.chessLogic.exportPgn(
        this.data.game.variant.key,
        this.data.game.initialFen,
        this.data.endSituation.pgnMoves
      )
      .then(res => window.plugins.socialsharing.share(res.pgn))
      .catch(console.error.bind(console));
    } else {
      window.plugins.socialsharing.share(renderStepsTxt(this.analyse.getSteps(this.vm.path)));
    }
  }.bind(this);

  this.init = function(data) {
    this.data = data;
    if (settings.analyse.supportedVariants.indexOf(this.data.game.variant.key) === -1) {
      window.plugins.toast.show(`Analysis board does not support ${this.data.game.variant.name} variant.`, 'short', 'center');
      m.route('/');
    }
    if (!data.game.moveTimes) this.data.game.moveTimes = [];
    this.ongoing = !util.isSynthetic(this.data) && gameApi.playable(this.data);
    this.analyse = new analyse(this.data);
    this.ceval = cevalCtrl(this.data.game.variant.key, allowCeval(), onCevalMsg.bind(this));
    this.explorer = explorerCtrl(this, true);
    this.evalSummary = this.data.analysis ? evalSummary.controller(this) : null;
    this.notes = this.data.game.speed === 'correspondence' ? new notes.controller(this) : null;

    let initialPath = location.hash ?
      treePath.default(parseInt(location.hash.replace(/#/, ''), 10)) :
        this.source === 'online' && gameApi.isPlayerPlaying(this.data) ?
          treePath.default(this.analyse.lastPly()) :
          treePath.default(this.analyse.firstPly());

    this.vm.path = initialPath;
    this.vm.pathStr = treePath.write(initialPath);

    showGround();
    this.initCeval();
    this.explorer.setStep();
  }.bind(this);

  this.isRemoteAnalysable = function() {
    return !this.data.analysis && !this.vm.analysisProgress &&
      session.isConnected() && gameApi.analysable(this.data);
  }.bind(this);

  if (this.source === 'online' && gameId) {
    gameXhr(gameId, orientation, false).then(cfg => {
      helper.analyticsTrackView('Analysis (online game)');
      cfg.orientation = orientation;
      this.init(makeData(cfg));
      // we must connect round socket in case the user wants to request a
      // computer analysis
      if (this.isRemoteAnalysable()) {
        connectGameSocket();
        // reconnect game socket after a cancelled seek
        signals.seekCanceled.add(connectGameSocket);
      }
      m.redraw();
      setTimeout(this.debouncedScroll, 250);
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
      this.init(makeData(otbData));
    }
  } else if (this.source === 'offline' && gameId === 'ai') {
    helper.analyticsTrackView('Analysis (offline ai)');
    const aiData = getAnalyseData(getCurrentAIGame());
    if (!aiData) {
      m.route('/analyse');
    } else {
      aiData.player.spectator = true;
      aiData.orientation = orientation;
      this.init(makeData(aiData));
    }
  }
  else {
    helper.analyticsTrackView('Analysis (empty)');
    this.init(makeDefaultData(fenArg, orientation));
  }

  window.plugins.insomnia.keepAwake();

  this.onunload = function() {
    if (this.chessground) {
      this.chessground.onunload();
      this.chessground = null;
    }
    if (this.ceval) this.ceval.destroy();
    if (this.chessLogic) this.chessLogic.onunload();
    window.plugins.insomnia.allowSleepAgain();
    signals.seekCanceled.remove(connectGameSocket);
  }.bind(this);
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
