import { debounce } from 'lodash';
import router from '../../router';
import signals from '../../signals';
import redraw from '../../utils/redraw';
import session from '../../session';
import sound from '../../sound';
import socket from '../../socket';
import * as gameApi from '../../lichess/game';
import { MoveRequest } from '../../scalachess';
import settings from '../../settings';
import { handleXhrError, oppositeColor, noop, hasNetwork } from '../../utils';
import promotion from '../shared/offlineRound/promotion';
import continuePopup from '../shared/continuePopup';
import { notesCtrl } from '../shared/round/notes';
import { getPGN } from '../shared/round/roundXhr';
import importPgnPopup from './importPgnPopup.js';
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
import { RoleToSan, SanToRole, Source, Path, ChessMove, ChesslogicInterface } from './interfaces';

const roleToSan: RoleToSan = {
  pawn: 'P',
  knight: 'N',
  bishop: 'B',
  rook: 'R',
  queen: 'Q'
};

const sanToRole: SanToRole = {
  P: 'pawn',
  N: 'knight',
  B: 'bishop',
  R: 'rook',
  Q: 'queen'
};

export default class AnalyseCtrl {
  public data: AnalysisData;
  public source: Source;
  public vm: any;
  public chessLogic: ChesslogicInterface;
  public settings: any;
  public menu: any;
  public continuePopup: any;
  public importPgnPopup: any;

  public chessground: Chessground.Controller;
  public analyse: any;
  public ceval: any;
  public explorer: any;
  public evalSummary: any;
  public notes: any;

  public static decomposeUci(uci: string): [Pos, Pos, San] {
    return [<Pos>uci.slice(0, 2), <Pos>uci.slice(2, 4), <San>uci.slice(4, 5)];
  }

  public constructor(data: AnalysisData, source: Source, shouldGoBack: boolean) {
    this.data = data;
    this.source = source;

    if (settings.analyse.supportedVariants.indexOf(this.data.game.variant.key) === -1) {
      window.plugins.toast.show(`Analysis board does not support ${this.data.game.variant.name} variant.`, 'short', 'center');
      router.set('/');
    }

    this.chessLogic = chessLogic(this);
    this.settings = analyseSettings.controller(this);
    this.menu = menu.controller(this);
    this.continuePopup = continuePopup.controller();
    this.importPgnPopup = importPgnPopup.controller(this);

    this.vm = {
      shouldGoBack,
      path: null,
      pathStr: '',
      step: null,
      cgConfig: null,
      variationMenu: null,
      flip: false,
      analysisProgress: false,
      showBestMove: settings.analyse.showBestMove(),
      showComments: settings.analyse.showComments()
    };

    this.analyse = new analyse(this.data);
    this.ceval = cevalCtrl(this.data.game.variant.key, this.allowCeval(), this.onCevalMsg);
    this.explorer = explorerCtrl(this, true);
    this.evalSummary = this.data.analysis ? evalSummary.controller(this) : null;
    this.notes = this.data.game.speed === 'correspondence' ? new notesCtrl(this) : null;

    const initialPath = location.hash ?
      treePath.default(parseInt(location.hash.replace(/#/, ''), 10)) :
      this.source === 'online' && gameApi.isPlayerPlaying(this.data) ?
        treePath.default(this.analyse.lastPly()) :
        treePath.default(this.analyse.firstPly());

    this.vm.path = initialPath;
    this.vm.pathStr = treePath.write(initialPath);

    this.showGround();
    this.initCeval();
    this.explorer.setStep();

    if (this.isRemoteAnalysable()) {
      this.connectGameSocket();
      // reconnect game socket after a cancelled seek
      signals.seekCanceled.add(this.connectGameSocket);
    }
  }

  public connectGameSocket = () => {
    if (hasNetwork()) {
      socket.createGame(
        this.data.url.socket,
        this.data.player.version,
        socketHandler(this, this.data.game.id, orientation),
        this.data.url.round
      );
    }
  }

  public flip = () => {
    this.vm.flip = !this.vm.flip;
    this.chessground.set({
      orientation: this.vm.flip ? oppositeColor(this.data.orientation) : this.data.orientation
    });
  }

  private uciToLastMove(uci: string): [Pos, Pos] {
    if (!uci) return null;
    if (uci[1] === '@') return [<Pos>uci.substr(2, 2), <Pos>uci.substr(2, 2)];
    return [<Pos>uci.substr(0, 2), <Pos>uci.substr(2, 2)];
  }

  public initCeval = () => {
    if (this.ceval.enabled()) {
      if (this.ceval.isInit()) {
        this.startCeval();
      } else {
        this.ceval.init().then(this.startCeval);
      }
    }
  }

  private startCeval() {
    if (this.ceval.enabled() && this.canUseCeval()) {
      this.ceval.start(this.vm.path, this.analyse.getSteps(this.vm.path));
    }
  }


  private showGround() {
    let s = this.analyse.getStep(this.vm.path);
    // might happen to have no step, for exemple with a bad step number in location
    // hash
    if (!s) {
      this.vm.path = treePath.default(this.analyse.firstPly());
      this.vm.pathStr = treePath.write(this.vm.path);
      s = this.analyse.getStep(this.vm.path);
    }

    const color: Color = s.ply % 2 === 0 ? 'white' : 'black';
    const dests = util.readDests(s.dests);
    const config = {
      fen: s.fen,
      turnColor: color,
      orientation: this.vm.flip ? oppositeColor(this.data.orientation) : this.data.orientation,
      movableColor: dests && Object.keys(dests).length > 0 ? color : null,
      dests: dests || {},
      check: s.check,
      lastMove: this.uciToLastMove(s.uci)
    };

    if (this.data.game.variant.key === 'threeCheck' && !s.checkCount) {
      s.checkCount = util.readCheckCount(s.fen);
    }

    this.vm.step = s;
    this.vm.cgConfig = config;

    if (!this.chessground) {
      this.chessground = ground.make(this.data, config, this.userMove, this.userNewPiece);
    }
    this.chessground.set(config);
    if (!dests) this.debouncedDests();
  }

  public debouncedScroll = debounce(() => util.autoScroll(document.getElementById('replay')), 200);

  private updateHref = debounce(() => {
    window.history.replaceState(null, null, '#' + this.vm.step.ply);
  }, 750);

  private debouncedStartCeval = debounce(this.startCeval, 500);

  public jump = (path: Path, direction?: 'forward' | 'backward') => {
    this.vm.path = path;
    this.vm.pathStr = treePath.write(path);
    this.toggleVariationMenu(null);
    this.showGround();
    if (this.vm.step && this.vm.step.san && direction === 'forward') {
      if (this.vm.step.san.indexOf('x') !== -1) sound.capture();
      else sound.move();
    }
    this.ceval.stop();
    this.explorer.setStep();
    this.updateHref();
    this.debouncedStartCeval();
    this.debouncedScroll();
    promotion.cancel(this, this.vm.cgConfig);
  }

  public userJump = (path: Path, direction?: 'forward' | 'backward') => {
    this.jump(path, direction);
  }

  public jumpToMain = (ply: number) => {
    this.userJump([{
      ply: ply,
      variation: null
    }]);
  }

  public jumpToIndex = (index: number) => {
    this.jumpToMain(index + 1 + this.data.game.startedAtTurn);
  }

  public jumpToNag = (color: Color, nag: string) => {
    const ply = this.analyse.plyOfNextNag(color, nag, this.vm.step.ply);
    if (ply) this.jumpToMain(ply);
    redraw();
  }

  public canDrop = () => {
    return true;
  };

  private preparePremoving() {
    this.chessground.set({
      turnColor: this.chessground.data.movable.color,
      movableColor: oppositeColor(this.chessground.data.movable.color)
    });
  }

  private sendMove = (orig: Pos, dest: Pos, prom?: string) => {
    const move: MoveRequest = {
      orig: orig,
      dest: dest,
      variant: this.data.game.variant.key,
      fen: this.vm.step.fen,
      path: this.vm.pathStr,
      ply: this.vm.step.ply
    };
    if (prom) move.promotion = prom;
    this.chessLogic.sendMoveRequest(move);
    this.preparePremoving();
  }

  private userMove = (orig: Pos, dest: Pos, capture: boolean) => {
    this.vm.justPlayed = orig + dest;
    if (capture) sound.capture();
    else sound.move();
    if (!promotion.start(this, orig, dest, this.sendMove)) this.sendMove(orig, dest);
  }

  private userNewPiece = (piece: Piece, pos: Pos) => {
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
      this.preparePremoving();
    } else this.jump(this.vm.path);
  }

  public explorerMove = (uci: string) => {
    const move = AnalyseCtrl.decomposeUci(uci);
    if (uci[1] === '@') {
      this.chessground.apiNewPiece({
        color: this.chessground.data.movable.color,
        role: sanToRole[uci[0]]
      }, move[1]);
    } else if (!move[2]) {
      this.sendMove(move[0], move[1]);
    }
    else {
      this.sendMove(move[0], move[1], sanToRole[move[2].toUpperCase()]);
    }
    this.explorer.loading(true);
  }

  public addStep = (step: AnalysisStep, path: Path) => {
    const newPath = this.analyse.addStep(step, treePath.read(path));
    this.jump(newPath);
    redraw();
    this.chessground.playPremove();
  }

  public addDests = (dests: DestsMap, path: Path) => {
    this.analyse.addDests(dests, treePath.read(path));
    if (path === this.vm.pathStr) {
      this.showGround();
      redraw();
      if (dests === {}) this.ceval.stop();
    }
    this.chessground.playPremove();
  }

  public toggleVariationMenu = (path: Path) => {
    if (!path) {
      this.vm.variationMenu = null;
    } else {
      const key = treePath.write(path.slice(0, 1));
      this.vm.variationMenu = this.vm.variationMenu === key ? null : key;
    }
  }

  public deleteVariation = (path: Path) => {
    const ply = path[0].ply;
    const id = path[0].variation;
    this.analyse.deleteVariation(ply, id);
    if (treePath.contains(path, this.vm.path)) this.jumpToMain(ply - 1);
    this.toggleVariationMenu(null);
  }

  public promoteVariation = (path: Path) => {
    const ply = path[0].ply;
    const id = path[0].variation;
    this.analyse.promoteVariation(ply, id);
    if (treePath.contains(path, this.vm.path))
      this.jump(this.vm.path.splice(1));
    this.toggleVariationMenu(null);
  }

  public currentAnyEval = () => {
    return this.vm.step ? (this.vm.step.rEval || this.vm.step.ceval) : null;
  }

  private allowCeval() {
    return (
      this.source === 'offline' || util.isSynthetic(this.data) || !gameApi.playable(this.data)
    ) && gameApi.analysableVariants.indexOf(this.data.game.variant.key) !== -1;
  }

  private onCevalMsg = (res: any) => {
    this.analyse.updateAtPath(res.work.path, (step: AnalysisStep) => {
      if (step.ceval && step.ceval.depth >= res.ceval.depth) return;
      step.ceval = res.ceval;
      // even if we don't need the san move this ensure correct arrows are
      // displayed
      this.chessLogic.getSanMoveFromUci({
        fen: step.fen,
        orig: res.ceval.best.slice(0, 2),
        dest: res.ceval.best.slice(2, 4)
      }).then((data: ChessMove) => {
        step.ceval.bestSan = data.situation.pgnMoves[0];
        if (treePath.write(res.work.path) === this.vm.pathStr) {
          redraw();
        }
      })
      // we just ignore errors here
      // TODO should try to find a way to stop ceval msg after the position
      // has been changed
      .catch(noop);
    });
  }

  public canUseCeval = () => {
    return this.vm.step.dests !== '' && (!this.vm.step.rEval ||
      !this.nextStepBest());
  }

  public nextStepBest = () => {
    return this.analyse.nextStepEvalBest(this.vm.path);
  }

  public hasAnyComputerAnalysis = () => {
    return this.data.analysis || this.ceval.enabled();
  };

  public toggleBestMove = () => {
    this.vm.showBestMove = !this.vm.showBestMove;
  }

  public toggleComments = () => {
    this.vm.showComments = !this.vm.showComments;
  }

  public sharePGN = () => {
    if (this.source === 'online') {
      getPGN(this.data.game.id)
      .then(pgn => window.plugins.socialsharing.share(pgn))
      .catch(handleXhrError);
    } else if (this.source === 'offline') {
      const endSituation = this.data.situations[this.data.situations.length - 1];
      this.chessLogic.exportPgn(
        this.data.game.variant.key,
        this.data.game.initialFen,
        endSituation.pgnMoves
      )
      .then((res: any) => window.plugins.socialsharing.share(res.pgn))
      .catch(console.error.bind(console));
    } else {
      window.plugins.socialsharing.share(renderStepsTxt(this.analyse.getSteps(this.vm.path)));
    }
  }

  public isRemoteAnalysable = () => {
    return !this.data.analysis && !this.vm.analysisProgress &&
      session.isConnected() && gameApi.analysable(this.data);
  }

  private getDests = () => {
    if (!this.vm.step.dests) {
      this.chessLogic.sendDestsRequest({
        variant: this.data.game.variant.key,
        fen: this.vm.step.fen,
        path: this.vm.pathStr
      });
    }
  }

  private debouncedDests = debounce(this.getDests, 100);
}
