import { throttle } from 'lodash';
import redraw from '../../../utils/redraw';
import { saveOfflineGameData } from '../../../utils/offlineGames';
import { hasNetwork, boardOrientation, formatTimeInSecs, noop } from '../../../utils';
import i18n from '../../../i18n';
import gameStatus from '../../../lichess/status';
import session from '../../../session';
import socket from '../../../socket';
import router from '../../../router';
import sound from '../../../sound';
import { miniUser as miniUserXhr, toggleGameBookmark } from '../../../xhr';
import vibrate from '../../../vibrate';
import * as gameApi from '../../../lichess/game';
import { MiniUser } from '../../../lichess/interfaces';
import { MoveRequest, DropRequest, MoveOrDrop } from '../../../lichess/interfaces/game';
import * as chessFormat from '../../../utils/chessFormat';
import { gameTitle } from '../../shared/common';

import ground from './ground';
import promotion from './promotion';
import { Chat } from './chat';
import { notesCtrl } from './notes';
import ClockCtrl from './clock/ClockCtrl';
import CorrespondenceClockCtrl from './correspondenceClock/corresClockCtrl';
import socketHandler from './socketHandler';
import atomic from './atomic';
import * as xhr from './roundXhr';
import crazyValid from './crazy/crazyValid';
import { OnlineRoundInterface, AfterMoveMeta } from './';

interface VM {
  ply: number
  flip: boolean
  miniUser: MiniUser
  showingActions: boolean
  confirmResign: boolean
  goneBerserk: {
    [index: string]: boolean
  },
  moveToSubmit: MoveRequest
  dropToSubmit: DropRequest
  tClockEl: HTMLElement
  offlineWatcher: boolean
}

export default class OnlineRound implements OnlineRoundInterface {
  public id: string
  public data: OnlineGameData
  public chessground: Chessground.Controller
  public clock: ClockCtrl | null
  public correspondenceClock: any
  public chat: Chat
  public notes: any
  public onFeatured: () => void
  public onTVChannelChange: () => void
  public onUserTVRedirect: () => void
  public vm: VM
  public title: Mithril.Children
  public subTitle: string
  public tv: string

  private tournamentCountInterval: number
  private clockIntervId: number

  public constructor(
    id: string,
    cfg: OnlineGameData,
    flipped: boolean = false,
    onFeatured?: () => void,
    onTVChannelChange?: () => void,
    userTv?: string,
    onUserTVRedirect?: () => void
  ) {
    this.id = id;
    this.data = cfg;
    this.onTVChannelChange = onTVChannelChange;
    this.onFeatured = onFeatured;
    this.data.userTV = userTv;
    this.onUserTVRedirect = onUserTVRedirect;

    this.vm = {
      ply: this.lastPly(),
      flip: flipped,
      miniUser: {
        player: {
          showing: false,
          data: null
        },
        opponent: {
          showing: false,
          data: null
        }
      },
      showingActions: false,
      confirmResign: false,
      goneBerserk: {
        [this.data.player.color]: this.data.player.berserk,
        [this.data.opponent.color]: this.data.opponent.berserk
      },
      moveToSubmit: null,
      dropToSubmit: null,
      tClockEl: null,
      // I came to this game offline: I'm an offline watcher
      offlineWatcher: !hasNetwork()
    };
    this.chat = (session.isKidMode() || this.data.tv || (!this.data.player.spectator && (this.data.game.tournamentId || this.data.opponent.ai))) ?
      null : new Chat(this, session.isShadowban());

    this.notes = this.data.game.speed === 'correspondence' ? new (<any>notesCtrl)(this) : null;

    this.chessground = ground.make(
      this.data,
      cfg.game.fen,
      this.userMove,
      this.onUserNewPiece,
      this.onMove,
      this.onNewPiece
    );

    this.clock = this.data.clock ? new ClockCtrl(
      this.data.clock,
      this.data.player.spectator ? noop :
        throttle(() => socket.send('outoftime'), 500),
      this.data.player.spectator ? null : this.data.player.color
    ) : null;

    this.makeCorrespondenceClock();

    if (this.clock) this.clockIntervId = setInterval(this.clockTick, 100);
    else if (this.correspondenceClock) this.clockIntervId = setInterval(this.correspondenceClockTick, 6000);

    if (this.data.tournament) {
      this.tournamentCountInterval = setInterval(this.tournamentTick, 1000);
    }

    this.connectSocket();
    this.setTitle();

    document.addEventListener('resume', this.reloadGameData);
    window.plugins.insomnia.keepAwake();
  }

  private tournamentTick = () => {
    if (this.data.tournament.secondsToFinish > 0) {
      this.data.tournament.secondsToFinish--;
      if (this.vm.tClockEl) {
        this.vm.tClockEl.textContent =
          formatTimeInSecs(this.data.tournament.secondsToFinish) +
        ' • ';
      }
    } else {
      clearInterval(this.tournamentCountInterval);
    }
  }

  private connectSocket = () => {
    socket.createGame(
      this.data.url.socket,
      this.data.player.version,
      socketHandler(this, this.onFeatured, this.onUserTVRedirect),
      this.data.url.round,
      this.data.userTV
    );
  }

  public stepsHash(steps: Array<GameStep>) {
    let h = '';
    for (let i in steps) {
      h += steps[i].san;
    }
    return h;
  }

  public openUserPopup = (position: string, userId: string) => {
    if (!this.vm.miniUser[position].data) {
      miniUserXhr(userId).then(data => {
        this.vm.miniUser[position].data = data;
        redraw();
      })
      .catch(() => {
        this.vm.miniUser[position].showing = false;
        redraw();
      });
    }
    this.vm.miniUser[position].showing = true;
  }

  public closeUserPopup = (position: string) => {
    this.vm.miniUser[position].showing = false;
  }

  public showActions = () => {
    router.backbutton.stack.push(this.hideActions);
    this.vm.showingActions = true;
  }

  public hideActions = (fromBB?: string) => {
    if (fromBB !== 'backbutton' && this.vm.showingActions) router.backbutton.stack.pop();
    this.vm.showingActions = false;
  }

  public flip = () => {
    this.vm.flip = !this.vm.flip;
    if (this.data.tv) {
      if (this.vm.flip) router.set('/tv?flip=1', true);
      else router.set('/tv', true);
      return;
    }
    this.chessground.set({
      orientation: boardOrientation(this.data, this.vm.flip)
    });
  }

  public replaying() {
    return this.vm.ply !== this.lastPly();
  }

  public canDrop = () => {
    return !this.replaying() && gameApi.isPlayerPlaying(this.data);
  }

  public firstPly() {
    return this.data.steps[0].ply;
  }

  public lastPly() {
    return this.data.steps[this.data.steps.length - 1].ply;
  }

  public plyStep(ply: number) {
    return this.data.steps[ply - this.firstPly()];
  }

  public jump = (ply: number) => {
    if (ply < this.firstPly() || ply > this.lastPly()) return false;
    const isFwd = ply > this.vm.ply;
    this.vm.ply = ply;
    const s = this.plyStep(ply);
    const config: Chessground.SetConfig = {
      fen: s.fen,
      lastMove: s.uci ? chessFormat.uciToMove(s.uci) : null,
      check: s.check,
      turnColor: this.vm.ply % 2 === 0 ? 'white' : 'black'
    };
    if (!this.replaying()) {
      config.movableColor = gameApi.isPlayerPlaying(this.data) ? this.data.player.color : null;
      config.dests = gameApi.parsePossibleMoves(this.data.possibleMoves);
    }
    this.chessground.set(config);
    if (this.replaying()) this.chessground.stop();
    if (s.san && isFwd) {
      if (s.san.indexOf('x') !== -1) sound.throttledCapture();
      else sound.throttledMove();
    }
    return true;
  }

  public jumpNext = () => {
    return this.jump(this.vm.ply + 1);
  }

  public jumpPrev = () => {
    return this.jump(this.vm.ply - 1);
  }

  public jumpFirst = () => {
    return this.jump(this.firstPly());
  }

  public jumpLast = () => {
    return this.jump(this.lastPly());
  }

  public setTitle() {
    if (this.data.tv) {
      this.title = 'Lichess TV';
    }
    else if (this.data.userTV) {
      this.title = this.data.userTV;
    }
    else if (gameStatus.started(this.data)) {
      this.title = gameTitle(this.data);
    }
    else {
      this.title = 'lichess.org';
    }

    if (gameStatus.finished(this.data)) {
      this.subTitle = i18n('gameOver');
    } else if (gameApi.isPlayerTurn(this.data)) {
      this.subTitle = i18n('yourTurn');
    } else {
      this.subTitle = i18n('waitingForOpponent');
    }
  }

  public isClockRunning(): boolean {
    return this.data.clock && gameApi.playable(this.data) &&
      ((this.data.game.turns - this.data.game.startedAtTurn) > 1 || this.data.clock.running);
  }

  private clockTick = () => {
    if (this.isClockRunning()) this.clock.tick(this.data.game.player);
  }

  private makeCorrespondenceClock() {
    if (this.data.correspondence && !this.correspondenceClock)
      this.correspondenceClock = new (<any>CorrespondenceClockCtrl)(
        this,
        this.data.correspondence,
        () => socket.send('outoftime')
      );
  }

  private correspondenceClockTick = () => {
    if (this.correspondenceClock && gameApi.playable(this.data))
      this.correspondenceClock.tick(this.data.game.player);
  }

  public sendMove(orig: Pos, dest: Pos, prom: Role, isPremove: boolean = false) {
    const move = {
      u: orig + dest
    };
    if (prom) {
      move.u += (prom === 'knight' ? 'n' : prom[0]);
    }

    if (this.data.pref.submitMove && !isPremove) {
      setTimeout(() => {
        router.backbutton.stack.push(this.cancelMove);
        this.vm.moveToSubmit = move;
        redraw();
      }, this.data.pref.animationDuration || 0);
    } else {
      socket.send('move', move, {
        ackable: true,
        withLag: !!this.clock
      });
      if (this.data.game.speed === 'correspondence' && !hasNetwork()) {
        window.plugins.toast.show('You need to be connected to Internet to send your move.', 'short', 'center');
      }
    }
  }

  public sendNewPiece(role: Role, key: Pos, isPredrop: boolean) {
    const drop = {
      role: role,
      pos: key
    };
    if (this.data.pref.submitMove && !isPredrop) {
      setTimeout(() => {
        router.backbutton.stack.push(this.cancelMove);
        this.vm.dropToSubmit = drop;
        redraw();
      }, this.data.pref.animationDuration || 0);
    } else socket.send('drop', drop, {
      ackable: true,
      withLag: !!this.clock
    });
  }

  public cancelMove = (fromBB?: string) => {
    if (fromBB !== 'backbutton') router.backbutton.stack.pop();
    this.vm.moveToSubmit = null;
    this.vm.dropToSubmit = null;
    this.jump(this.vm.ply);
  }

  public submitMove = (v: boolean) => {
    if (v && (this.vm.moveToSubmit || this.vm.dropToSubmit)) {
      if (this.vm.moveToSubmit) {
        socket.send('move', this.vm.moveToSubmit, {
          ackable: true
        });
      } else if (this.vm.dropToSubmit) {
        socket.send('drop', this.vm.dropToSubmit, {
          ackable: true
        });
      }
      if (this.data.game.speed === 'correspondence' && !hasNetwork()) {
        window.plugins.toast.show('You need to be connected to Internet to send your move.', 'short', 'center');
      }
      this.vm.moveToSubmit = null;
      this.vm.dropToSubmit = null;
    } else {
      this.cancelMove();
    }
  }

  public apiMove(o: MoveOrDrop) {
    const d = this.data;
    d.game.turns = o.ply;
    d.game.player = o.ply % 2 === 0 ? 'white' : 'black';
    const playedColor: Color = o.ply % 2 === 0 ? 'black' : 'white';
    const white: Player = d.player.color === 'white' ?  d.player : d.opponent;
    const black: Player = d.player.color === 'black' ? d.player : d.opponent;

    if (o.status) {
      d.game.status = o.status;
    }

    if (o.winner) {
      d.game.winner = o.winner;
    }

    let wDraw = white.offeringDraw;
    let bDraw = black.offeringDraw;
    if (!wDraw && o.wDraw) {
      sound.dong();
      vibrate.quick();
    }
    if (!bDraw && o.bDraw) {
      sound.dong();
      vibrate.quick();
    }
    white.offeringDraw = o.wDraw;
    black.offeringDraw = o.bDraw;

    d.possibleMoves = d.player.color === d.game.player ? o.dests : null;
    d.possibleDrops = d.player.color === d.game.player ? o.drops : null;

    this.setTitle();

    if (!this.replaying()) {
      this.vm.ply++;

      const enpassantPieces: {[index:string]: Piece} = {};
      if (o.enpassant) {
        const p = o.enpassant;
        enpassantPieces[p.key] = null;
        if (d.game.variant.key === 'atomic') {
          atomic.enpassant(this.chessground, p.key, p.color);
        } else {
          sound.capture();
        }
      }

      const castlePieces: {[index:string]: Piece} = {};
      if (o.castle && !this.chessground.data.autoCastle) {
        const c = o.castle;
        castlePieces[c.king[0]] = null;
        castlePieces[c.rook[0]] = null;
        castlePieces[c.king[1]] = {
          role: 'king',
          color: c.color
        };
        castlePieces[c.rook[1]] = {
          role: 'rook',
          color: c.color
        };
      }

      const pieces = Object.assign({}, enpassantPieces, castlePieces);
      const newConf = {
        turnColor: d.game.player,
        dests: gameApi.isPlayerPlaying(d) ?
          gameApi.parsePossibleMoves(d.possibleMoves) : <DestsMap>{},
        check: o.check
      };
      if (o.isMove) {
        const move = chessFormat.uciToMove(o.uci);
        this.chessground.apiMove(
          move[0],
          move[1],
          pieces,
          newConf
        );
      } else {
        this.chessground.apiNewPiece(
          {
            role: o.role,
            color: playedColor
          },
          chessFormat.uciToDropPos(o.uci),
          newConf
        );
      }

      if (o.promotion) {
        ground.promote(this.chessground, o.promotion.key, o.promotion.pieceClass);
      }
    }

    if (o.clock) {
      const c = o.clock;
      if (this.clock) this.clock.update(c.white, c.black);
      else if (this.correspondenceClock) this.correspondenceClock.update(c.white, c.black);
    }

    d.game.threefold = !!o.threefold;
    d.steps.push({
      ply: this.lastPly() + 1,
      fen: o.fen,
      san: o.san,
      uci: o.uci,
      check: o.check,
      crazy: o.crazyhouse
    });
    gameApi.setOnGame(d, playedColor, true);

    if (!this.replaying() && playedColor !== d.player.color &&
      (this.chessground.data.premovable.current || this.chessground.data.predroppable.current.key)) {
      // atrocious hack to prevent race condition
      // with explosions and premoves
      // https://github.com/ornicar/lila/issues/343
      const premoveDelay = d.game.variant.key === 'atomic' ? 100 : 10;
      setTimeout(() => {
        this.chessground.playPremove();
        this.playPredrop();
      }, premoveDelay);
    }

    if (this.data.game.speed === 'correspondence') {
      session.refresh();
      saveOfflineGameData(this.id, this.data);
    }

  }

  public reload = (rCfg: OnlineGameData) => {
    if (this.stepsHash(rCfg.steps) !== this.stepsHash(this.data.steps))
      this.vm.ply = rCfg.steps[rCfg.steps.length - 1].ply;
    if (this.chat) this.chat.onReload(rCfg.chat);
    if (this.data.tv) rCfg.tv = this.data.tv;
    if (this.data.userTV) rCfg.userTV = this.data.userTV;

    this.data = rCfg;

    this.makeCorrespondenceClock();
    if (this.clock) this.clock.update(this.data.clock.white, this.data.clock.black);
    this.setTitle();
    if (!this.replaying()) ground.reload(this.chessground, this.data, rCfg.game.fen, this.vm.flip);
    redraw();
  }

  public goBerserk() {
    throttle(() => socket.send('berserk'), 500)();
    sound.berserk();
  }

  public setBerserk(color: Color) {
    if (this.vm.goneBerserk[color]) return;
    this.vm.goneBerserk[color] = true;
    if (color !== this.data.player.color) sound.berserk();
    redraw();
  }

  public toggleBookmark = () => {
    return toggleGameBookmark(this.data.game.id).then(this.reloadGameData);
  }

  public unload() {
    clearInterval(this.clockIntervId);
    clearInterval(this.tournamentCountInterval);
    document.removeEventListener('resume', this.reloadGameData);
    if (this.chat) this.chat.unload();
    if (this.notes) this.notes.unload();
  }

  private userMove = (orig: Pos, dest: Pos, meta: AfterMoveMeta) => {
    if (!promotion.start(this, orig, dest, meta.premove)) {
      this.sendMove(orig, dest, undefined, meta.premove);
    }
  }

  private onUserNewPiece = (role: Role, key: Pos, meta: AfterMoveMeta) => {
    if (!this.replaying() && crazyValid.drop(this.chessground, this.data, role, key, this.data.possibleDrops)) {
      this.sendNewPiece(role, key, meta.predrop);
    } else {
      this.jump(this.vm.ply);
    }
  }

  private onMove = (orig: Pos, dest: Pos, capturedPiece: Piece) => {
    if (capturedPiece) {
      if (this.data.game.variant.key === 'atomic') {
        atomic.capture(this.chessground, dest);
        sound.explosion();
      }
      else {
        sound.capture();
      }
    } else {
      sound.move();
    }

    if (!this.data.player.spectator) {
      vibrate.quick();
    }
  }

  private onNewPiece = () => {
    sound.move();
  };

  private playPredrop() {
    return this.chessground.playPredrop((drop: Drop) => {
      return crazyValid.drop(this.chessground, this.data, drop.role, drop.key, this.data.possibleDrops);
    });
  }

  private reloadGameData = () => {
    xhr.reload(this).then(this.reload);
  }

}
