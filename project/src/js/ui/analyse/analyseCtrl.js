import analyse from './analyse';
import treePath from './path';
import ground from './ground';
import promotion from './promotion';
import * as util from './util';
import sound from '../../sound';
import { debounce, throttle } from 'lodash/function';
import socket from '../../socket';
import cevalCtrl from './ceval/cevalCtrl';
import gameApi from '../../lichess/game';
import settings from '../../settings';
import { handleXhrError, oppositeColor } from '../../utils';
import { game as gameXhr } from '../../xhr';
import data, { defaultData } from './data';
import chessLogic from './chessLogic';
import m from 'mithril';

export default function controller() {

  this.data = defaultData;
  this.gameId = m.route.param('id');
  this.userId = m.route.param('userId');
  this.ongoing = !util.isSynthetic(this.data) && gameApi.playable(this.data);
  this.onMyTurn = this.data;

  if (this.gameId) {
    gameXhr(m.route.param('id')).then(function(cfg) {
      this.data = data(cfg);
    }, err => {
      handleXhrError(err);
      m.route('/');
    });
  }

  this.chessLogic = new chessLogic(this);

  this.analyse = new analyse(this.data.steps);

  var initialPath = treePath.default(this.analyse.firstPly());

  if (initialPath[0].ply >= this.data.steps.length) {
    initialPath = treePath.default(this.data.steps.length - 1);
  }

  this.vm = {
    path: initialPath,
    pathStr: treePath.write(initialPath),
    initialPathStr: '',
    step: null,
    cgConfig: null,
    comments: true,
    flip: false,
    showGauge: settings.analyse.showGauge(),
    variationMenu: null
  };

  this.flip = function() {
    this.vm.flip = !this.vm.flip;
    this.chessground.set({
      orientation: this.vm.flip ? this.data.opponent.color : this.data.player.color
    });
  }.bind(this);

  function uciToLastMove(uci) {
    if (!uci) return null;
    if (uci[1] === '@') return [uci.substr(2, 2), uci.substr(2, 2)];
    return [uci.substr(0, 2), uci.substr(2, 2)];
  }

  const throttledStartCeval = throttle(startCeval.bind(this), 800);

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
    const color = s.ply % 2 === 0 ? 'white' : 'black';
    const dests = util.readDests(s.dests);
    const drops = util.readDrops(s.drops);
    const config = {
      fen: s.fen,
      turnColor: color,
      movable: {
        color: (dests && Object.keys(dests).length > 0) || drops === null || drops.length ? color : null,
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
    if (!dests) debounce(getDests.bind(this), 100)();
    // setAutoShapesFromEval();
  }.bind(this);

  this.jump = function(path) {
    this.vm.path = path;
    this.vm.pathStr = treePath.write(path);
    this.toggleVariationMenu(null);
    showGround();
    if (!this.vm.step.uci) sound.move(); // initial position
    else if (this.vm.justPlayed !== this.vm.step.uci) {
      if (this.vm.step.san.indexOf('x') !== -1) sound.capture();
      else sound.move();
      this.vm.justPlayed = null;
    }
    if (/\+|\#/.test(this.vm.step.san)) sound.check();
    this.ceval.stop();
    throttledStartCeval();
    promotion.cancel(this);
  }.bind(this);

  this.userJump = function(path) {
    this.jump(path);
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

  // const pieceToSan = {
  //   pawn: 'P',
  //   knight: 'N',
  //   bishop: 'B',
  //   rook: 'R',
  //   queen: 'Q'
  // };

  function userNewPiece() {
    this.jump(this.vm.path);
  }

  var preparePremoving = function() {
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
      path: this.vm.pathStr
    };
    if (prom) move.promotion = prom;
    this.chessLogic.sendMoveRequest(move);
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

  var allowCeval = (
    util.isSynthetic(this.data) || !gameApi.playable(this.data)
  ) && ['standard', 'fromPosition', 'chess960'].indexOf(this.data.game.variant.key) !== -1;

  this.ceval = cevalCtrl(allowCeval, function(res) {
    this.analyse.updateAtPath(res.work.path, function(step) {
      if (step.ceval && step.ceval.depth >= res.oEval.depth) return;
      step.ceval = res.oEval;
      if (treePath.write(res.work.path) === this.vm.pathStr) {
        m.redraw();
      }
    }.bind(this));
  }.bind(this));

  this.canUseCeval = function() {
    return this.vm.step.dests !== '' && (!this.vm.step.oEval || !this.analyse.nextStepEvalBest(this.vm.path));
  }.bind(this);

  function startCeval() {
    if (this.ceval.enabled() && this.canUseCeval())
      this.ceval.start(this.vm.path, this.analyse.getSteps(this.vm.path));
  }

  this.toggleCeval = function() {
    this.ceval.toggle();
    throttledStartCeval();
  }.bind(this);

  this.showEvalGauge = function() {
    return this.hasAnyComputerAnalysis() && this.vm.showGauge() && this.vm.step.dests !== '';
  }.bind(this);

  this.hasAnyComputerAnalysis = function() {
    return this.data.analysis || this.ceval.enabled();
  };

  this.toggleGauge = function() {
    this.vm.showGauge(!this.vm.showGauge());
  }.bind(this);

  this.onunload = function() {
    socket.destroy();
  };

  showGround();
  // startCeval();
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
