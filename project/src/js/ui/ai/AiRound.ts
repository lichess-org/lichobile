import i18n from '../../i18n';
import sound from '../../sound';
import vibrate from '../../vibrate';
import storage from '../../storage';
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
import replayCtrl from '../shared/offlineRound/replayCtrl';

import actions from './actions';
import engineCtrl, { EngineInterface } from './engine';
import helper from '../helper';
import newGameMenu from './newAiGame';

export const storageFenKey = 'ai.setupFen';

export default class AiRound implements AiRoundInterface {
  public data: OfflineGameData;
  public actions: any;
  public newGameMenu: any;
  public chessground: Chessground.Controller;
  public chessWorker: Worker;
  public replay: any;
  public vm: any;

  private engine: EngineInterface;

  public constructor(saved?: StoredOfflineGame, setupFen?: string) {
    this.engine = engineCtrl(this);
    this.chessWorker = new Worker('vendor/scalachessjs.js');
    this.actions = actions.controller(this);
    this.newGameMenu = newGameMenu.controller(this);

    this.vm = {
      engineSearching: false
    };

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
  }

  private init(data: OfflineGameData, situations: Array<GameSituation>, ply: number) {
    this.newGameMenu.close();
    this.actions.close();
    this.data = data;

    if (!this.replay) {
      this.replay = new replayCtrl(this, situations, ply, this.chessWorker);
    } else {
      this.replay.init(situations, ply);
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

    redraw();
  }

  public startNewGame = (setupFen?: string) => {
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
  }

  private save() {
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

  public onReplayAdded = () => {
    const sit = this.replay.situation();
    setResult(this, sit.status);
    if (gameStatusApi.finished(this.data)) {
      this.onGameEnd();
    } else if (this.isEngineToMove()) {
      this.engineMove();
    }
    this.save();
    redraw();
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
    this.replay.apply();
    return false;
  }

  public jumpFirst = () => {
    return this.jump(this.firstPly());
  }

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

  public jumpLast = () => {
    return this.jump(this.lastPly());
  }
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
