import i18n from '../../i18n';
import router from '../../router';
import sound from '../../sound';
import vibrate from '../../vibrate';
import settings from '../../settings';
import gameStatusApi from '../../lichess/status';
import { askWorker, oppositeColor, aiName, noop, getRandomArbitrary } from '../../utils';
import { setCurrentAIGame } from '../../utils/offlineGames';
import redraw from '../../utils/redraw';

import promotion from '../shared/offlineRound/promotion';
import ground from '../shared/offlineRound/ground';
import makeData from '../shared/offlineRound/data';
import { setResult } from '../shared/offlineRound';
import atomic from '../shared/round/atomic';
import { AiRoundInterface } from '../shared/round';
import Replay from '../shared/offlineRound/Replay';

import actions from './actions';
import engineCtrl, { EngineInterface } from './engine';
import * as helper from '../helper';
import newGameMenu from './newAiGame';

interface InitPayload {
  variant: VariantKey
  fen?: string
}

export default class AiRound implements AiRoundInterface {
  public data: OfflineGameData;
  public actions: any;
  public newGameMenu: any;
  public chessground: Chessground.Controller;
  public chessWorker: Worker;
  public replay: Replay;
  public vm: any;

  private engine: EngineInterface;

  public constructor(saved?: StoredOfflineGame, setupFen?: string) {
    this.engine = engineCtrl(this);
    this.chessWorker = new Worker('vendor/scalachessjs.js');
    this.actions = actions.controller(this);
    this.newGameMenu = newGameMenu.controller(this);

    this.vm = {
      engineSearching: false,
      setupFen,
      savedFen: saved && saved.data.game.fen
    };

    if (setupFen) {
      this.newGameMenu.open();
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

  public init(data: OfflineGameData, situations: Array<GameSituation>, ply: number) {
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
        this.chessWorker,
        this.onReplayAdded,
        this.onThreefoldRepetition
      );
    } else {
      this.replay.init(variant, initialFen, situations, ply);
    }

    if (!this.chessground) {
      this.chessground = ground.make(this.data, this.replay.situation(), this.userMove, noop, this.onMove, noop);
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
    if (setupFen && !['horde', 'racingKings'].includes(variant)) {
      payload.fen = setupFen;
    }

    helper.analyticsTrackEvent('Offline AI Game', `New game ${variant}`);

    askWorker(this.chessWorker, {
      topic: 'init',
      payload,
    })
    .then(data => {
      this.init(makeData({
        variant: data.variant,
        initialFen: data.setup.fen,
        fen: data.setup.fen,
        color: getColorFromSettings()
      }), [data.setup], 0);
    })
    .then(() => {
      if (setupFen) {
        this.vm.setupFen = null;
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

  private addMove(orig: Pos, dest: Pos, promotionRole?: Role) {
    this.replay.addMove(orig, dest, promotionRole);
  }

  public playerName = () => {
    return i18n(this.data.player.color);
  }

  public getOpponent() {
    const level = settings.ai.opponent();
    const name = settings.ai.availableOpponents.find(e => e[1] === level)[0];
    return {
      name: i18n('aiNameLevelAiLevel', name, level),
      level: parseInt(level) || 1
    };
  }

  public onEngineBestMove = (bestmove: string) => {
    const from = <Pos>bestmove.slice(0, 2);
    const to = <Pos>bestmove.slice(2, 4);
    this.vm.engineSearching = false;
    this.chessground.apiMove(from, to);
    this.addMove(from, to);
    redraw();
  }

  private engineMove = () => {
    this.vm.engineSearching = true;
    const sit = this.replay.situation();
    setTimeout(() => {
      const l = this.getOpponent().level;
      this.data.opponent.username = aiName({
        engineName: 'Stockfish',
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
    this.addMove(orig, dest, role);
  }

  private userMove = (orig: Pos, dest: Pos) => {
    if (!promotion.start(this, orig, dest, this.onPromotion)) {
      this.addMove(orig, dest);
    }
  }

  private onMove = (orig: Pos, dest: Pos, capturedPiece: Piece) => {
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

  public apply(sit: GameSituation) {
    if (sit) {
      const lastUci = sit.uciMoves.length ? sit.uciMoves[sit.uciMoves.length - 1] : null;
      this.chessground.set({
        fen: sit.fen,
        turnColor: sit.player,
        lastMove: lastUci ? [<Pos>lastUci.slice(0, 2), <Pos>lastUci.slice(2, 4)] : null,
        dests: sit.dests,
        movableColor: sit.player,
        check: sit.check
      });
    }
  }

  public onReplayAdded = (sit: GameSituation) => {
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

  public firstPly = () => {
    return this.data.player.color === 'black' ? 1 : 0;
  }

  public lastPly = () => {
    return this.replay.situations[this.replay.situations.length - 1].ply;
  }

  public jump = (ply: number) => {
    this.chessground.cancelMove();
    if (this.replay.ply === ply || ply < 0 || ply >= this.replay.situations.length) return;
    this.replay.ply = ply;
    this.apply(this.replay.situation());
    return false;
  }

  public jumpFirst = () => this.jump(this.firstPly());

  public jumpPrev = () => {
    const ply = this.replay.ply;
    if (this.data.player.color === 'black') {
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
