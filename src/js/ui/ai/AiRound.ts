import i18n from '../../i18n';
import router from '../../router';
import * as chess from '../../chess';
import * as chessFormat from '../../utils/chessFormat';
import sound from '../../sound';
import vibrate from '../../vibrate';
import settings from '../../settings';
import gameStatusApi from '../../lichess/status';
import { playerFromFen } from '../../utils/fen';
import { oppositeColor, aiName, getRandomArbitrary } from '../../utils';
import { StoredOfflineGame, setCurrentAIGame } from '../../utils/offlineGames';
import { specialFenVariants } from '../../lichess/variant';
import { OfflineGameData, GameStatus } from '../../lichess/interfaces/game';
import redraw from '../../utils/redraw';

import promotion from '../shared/offlineRound/promotion';
import ground from '../shared/offlineRound/ground';
import makeData from '../shared/offlineRound/data';
import { setResult } from '../shared/offlineRound';
import atomic from '../shared/round/atomic';
import crazyValid from '../shared/round/crazy/crazyValid';
import { AiRoundInterface, AiVM, PromotingInterface } from '../shared/round';
import Replay from '../shared/offlineRound/Replay';

import actions, { AiActionsCtrl } from './actions';
import engineCtrl, { EngineInterface } from './engine';
import * as helper from '../helper';
import newGameMenu, { NewAiGameCtrl } from './newAiGame';

interface InitPayload {
  variant: VariantKey
  fen?: string
}

export default class AiRound implements AiRoundInterface, PromotingInterface {
  public data: OfflineGameData
  public actions: AiActionsCtrl
  public newGameMenu: NewAiGameCtrl
  public chessground: Chessground.Controller
  public replay: Replay
  public vm: AiVM

  public engine: EngineInterface;

  public constructor(saved?: StoredOfflineGame | null, setupFen?: string) {
    this.engine = engineCtrl(this);
    this.actions = actions.controller(this);
    this.newGameMenu = newGameMenu.controller(this);

    this.vm = {
      engineSearching: false,
      setupFen,
      savedFen: saved ? saved.data.game.fen : undefined
    }

    if (setupFen) {
      this.newGameMenu.isOpen(true);
    }

    this.engine.init()
    .then(() => {
      const currentVariant = <VariantKey>settings.ai.variant();
      if (!setupFen) {
        if (saved) {
          try {
            this.init(saved.data, saved.situations, saved.ply);
          } catch (e) {
            console.log(e, 'Fail to load saved game');
            this.startNewGame(currentVariant);
          }
        } else {
          this.startNewGame(currentVariant);
        }
      }
    });
  }

  public init(data: OfflineGameData, situations: Array<chess.GameSituation>, ply: number) {
    this.newGameMenu.close();
    this.actions.close();
    this.data = data;

    const variant = this.data.game.variant.key;
    const initialFen = this.data.game.initialFen;

    if (!this.replay) {
      this.replay = new Replay(
        variant,
        initialFen,
        situations,
        ply,
        this.onReplayAdded,
        this.onThreefoldRepetition
      );
    } else {
      this.replay.init(variant, initialFen, situations, ply);
    }

    if (!this.chessground) {
      this.chessground = ground.make(this.data, this.replay.situation(), this.userMove, this.onUserNewPiece, this.onMove, this.onNewPiece);
    } else {
      ground.reload(this.chessground, this.data, this.replay.situation());
    }

    this.engine.prepare(this.data.game.variant.key)
    .then(() => {
      if (this.isEngineToMove()) {
        this.engineMove();
      }
    });

    this.save();
    redraw();
  }

  public startNewGame(variant: VariantKey, setupFen?: string) {
    const payload: InitPayload = {
      variant
    }
    if (setupFen && !specialFenVariants.includes(variant)) {
      payload.fen = setupFen;
    }

    helper.analyticsTrackEvent('Offline AI Game', `New game ${variant}`);

    chess.init(payload)
    .then((data: chess.InitResponse) => {
      this.init(makeData({
        id: 'offline_ai',
        variant: data.variant,
        initialFen: data.setup.fen,
        fen: data.setup.fen,
        color: getColorFromSettings(),
        player: data.setup.player
      }), [data.setup], 0);
    })
    .then(() => {
      if (setupFen) {
        this.vm.setupFen = undefined
        router.replaceState('/ai');
      }
    });
  }

  public save() {
    setCurrentAIGame({
      data: this.data,
      situations: this.replay.situations,
      ply: this.replay.ply
    });
  }

  public playerName = (): string => {
    return this.data.player.username!
  }

  public white(): string {
    if (this.data.player.color === 'white')
      // set in offlineround data
      return this.data.player.username!
    else
      return this.getOpponent().name
  }

  public black(): string {
    if (this.data.player.color === 'black')
      // set in offlineround data
      return this.data.player.username!
    else
      return this.getOpponent().name;
  }

  public getOpponent() {
    const level = settings.ai.opponent();
    const opp = settings.ai.availableOpponents.find(e => e[1] === level)
    const name = opp && opp.length && opp[0] || 'Stockfish'
    return {
      name: i18n('aiNameLevelAiLevel', name, level),
      level: parseInt(level) || 1
    };
  }

  public player(): Color {
    return this.data.player.color
  }

  public onEngineMove = (bestmove: string) => {
    const from = <Pos>bestmove.slice(0, 2);
    const to = <Pos>bestmove.slice(2, 4);
    this.vm.engineSearching = false;
    this.chessground.apiMove(from, to);
    this.replay.addMove(from, to);
    redraw();
  }

  public onEngineDrop = (bestdrop: string) => {
    const pos = chessFormat.uciToDropPos(bestdrop);
    const role = chessFormat.uciToDropRole(bestdrop);
    const piece = { role, color: this.data.opponent.color };
    this.vm.engineSearching = false;
    this.chessground.apiNewPiece(piece, pos);
    this.replay.addDrop(role, pos);
    redraw();
  }

  private engineMove = () => {
    this.vm.engineSearching = true;
    const sit = this.replay.situation();
    setTimeout(() => {
      const l = this.getOpponent().level;
      this.data.opponent.name = aiName({
        ai: l
      });
      this.engine.setLevel(l)
      .then(() => this.engine.search(this.data.game.initialFen, sit.uciMoves.join(' ')));
    }, 500);
  }

  private isEngineToMove = () => {
    const sit = this.replay.situation();
    return !sit.end && sit.player !== this.data.player.color;
  }

  private onPromotion = (orig: Pos, dest: Pos, role: Role) => {
    this.replay.addMove(orig, dest, role);
  }

  private userMove = (orig: Pos, dest: Pos) => {
    if (!promotion.start(this.chessground, orig, dest, this.onPromotion)) {
      this.replay.addMove(orig, dest);
    }
  }

  private onMove = (_: Pos, dest: Pos, capturedPiece: Piece) => {
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
  }

  private onUserNewPiece = (role: Role, key: Pos) => {
    const sit = this.replay.situation();
    if (crazyValid.drop(this.chessground, this.data, role, key, sit.drops)) {
      this.replay.addDrop(role, key);
    } else {
      this.apply(this.replay.situation());
    }
  }

  private onNewPiece = () => {
    sound.move();
  }

  public apply(sit: chess.GameSituation) {
    if (sit) {
      const lastUci = sit.uciMoves.length ? sit.uciMoves[sit.uciMoves.length - 1] : null;
      this.chessground.set({
        fen: sit.fen,
        turnColor: sit.player,
        lastMove: lastUci ? chessFormat.uciToMoveOrDrop(lastUci) : undefined,
        dests: sit.dests,
        movableColor: sit.player === this.data.player.color ? sit.player : undefined,
        check: sit.check
      });
    }
  }

  public onReplayAdded = (sit: chess.GameSituation) => {
    this.data.game.fen = sit.fen;
    this.apply(sit);
    setResult(this, sit.status);
    if (gameStatusApi.finished(this.data)) {
      this.onGameEnd();
    } else if (this.isEngineToMove()) {
      this.engineMove();
    }
    this.save();
    redraw();
  }

  public onThreefoldRepetition = (newStatus: GameStatus) => {
    setResult(this, newStatus);
    this.save();
    this.onGameEnd();
  }

  public onGameEnd = () => {
    const self = this;
    this.chessground.cancelMove();
    this.chessground.stop();
    setTimeout(function() {
      self.actions.open();
      redraw();
    }, 500);
  }

  public resign = () => {
    setResult(this, { id: 31, name: 'resign' }, oppositeColor(this.data.player.color));
    this.save();
    this.onGameEnd();
  }

  private firstPlayerColor(): Color {
    return playerFromFen(this.data.game.initialFen);
  }

  public firstPly = () => {
    return this.data.player.color === oppositeColor(this.firstPlayerColor()) ? 1 : 0;
  }

  public lastPly = () => {
    return this.replay.situations.length - 1;
  }

  public jump = (ply: number) => {
    this.chessground.cancelMove();
    if (this.replay.ply === ply || ply < 0 || ply >= this.replay.situations.length) return false
    this.replay.ply = ply;
    this.apply(this.replay.situation());
    return false;
  }

  public jumpFirst = () => this.jump(this.firstPly());

  public jumpPrev = () => {
    const ply = this.replay.ply;
    if (this.data.player.color === oppositeColor(this.firstPlayerColor())) {
      const offset = ply % 2 === 0 ? 1 : 2;
      return this.jump(ply - offset);
    } else {
      const offset = ply % 2 === 0 ? 2 : 1;
      return this.jump(ply - offset);
    }
  }

  public jumpNext = () => {
    const ply = this.replay.ply;
    return this.jump(ply + (ply + 2 >= this.replay.situations.length ? 1 : 2));
  }

  public jumpLast = () => this.jump(this.lastPly());

  public canDrop = () => true;
}

function getColorFromSettings(): Color {
  let color = settings.ai.color();
  if (color === 'random') {
    if (getRandomArbitrary(0, 2) > 1)
      color = 'white';
    else
      color = 'black';
  }

  return <Color>color;
}
