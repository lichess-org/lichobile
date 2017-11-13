import * as throttle from 'lodash/throttle'
import Chessground from '../../../chessground/Chessground'
import * as cg from '../../../chessground/interfaces'
import redraw from '../../../utils/redraw'
import { saveOfflineGameData, removeOfflineGameData } from '../../../utils/offlineGames'
import { hasNetwork, boardOrientation } from '../../../utils'
import session from '../../../session'
import socket from '../../../socket'
import router from '../../../router'
import sound from '../../../sound'
import { miniUser as miniUserXhr, toggleGameBookmark } from '../../../xhr'
import vibrate from '../../../vibrate'
import * as gameApi from '../../../lichess/game'
import { MiniUser } from '../../../lichess/interfaces'
import { OnlineGameData, Player, ApiEnd } from '../../../lichess/interfaces/game'
import { MoveRequest, DropRequest, MoveOrDrop, AfterMoveMeta, isMove, isDrop, isMoveRequest, isDropRequest } from '../../../lichess/interfaces/move'
import * as chessFormat from '../../../utils/chessFormat'

import ground from './ground'
import promotion from './promotion'
import { Chat } from './chat'
import { NotesCtrl } from './notes'
import ClockCtrl from './clock/ClockCtrl'
import CorresClockCtrl from './correspondenceClock/corresClockCtrl'
import socketHandler from './socketHandler'
import atomic from './atomic'
import * as xhr from './roundXhr'
import crazyValid from './crazy/crazyValid'
import { OnlineRoundInterface } from './'

interface VM {
  ply: number
  flip: boolean
  miniUser: MiniUser
  showingActions: boolean
  confirmResign: boolean
  goneBerserk: {
    [index: string]: boolean
  },
  moveToSubmit: MoveRequest | null
  dropToSubmit: DropRequest | null
  tClockEl: HTMLElement | null
  offlineWatcher: boolean
}

export default class OnlineRound implements OnlineRoundInterface {
  public id: string
  public data: OnlineGameData
  public chessground: Chessground
  public clock: ClockCtrl | null
  public correspondenceClock: CorresClockCtrl
  public chat: Chat | null
  public notes: NotesCtrl | null
  public onFeatured?: () => void
  public onTVChannelChange?: () => void
  public onUserTVRedirect?: () => void
  public vm: VM
  public title: Mithril.Children
  public subTitle: string
  public tv: string

  private lastMoveMillis?: number
  private lastDrawOfferAtPly: number
  private clockIntervId: number
  private clockTimeoutId: number

  public constructor(
    id: string,
    cfg: OnlineGameData,
    flipped: boolean = false,
    onFeatured?: () => void,
    onTVChannelChange?: () => void,
    userTv?: string,
    onUserTVRedirect?: () => void
  ) {
    this.id = id
    this.setData(cfg)
    this.onTVChannelChange = onTVChannelChange
    this.onFeatured = onFeatured
    this.data.userTV = userTv
    this.onUserTVRedirect = onUserTVRedirect

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
        [this.data.player.color]: !!this.data.player.berserk,
        [this.data.opponent.color]: !!this.data.opponent.berserk
      },
      moveToSubmit: null,
      dropToSubmit: null,
      tClockEl: null,
      // I came to this game offline: I'm an offline watcher
      offlineWatcher: !hasNetwork()
    }

    this.chat = (session.isKidMode() || this.data.tv || (!this.data.player.spectator && (this.data.game.tournamentId || this.data.opponent.ai))) ?
      null : new Chat(this, session.isShadowban())

    this.notes = this.data.game.speed === 'correspondence' ? new NotesCtrl(this.data) : null

    this.chessground = ground.make(
      this.data,
      cfg.game.fen,
      this.userMove,
      this.onUserNewPiece,
      this.onMove,
      this.onNewPiece
    )

    this.clock = this.data.clock ? new ClockCtrl(this.data, {
      onFlag: this.outoftime,
      soundColor: this.data.player.spectator ? null : this.data.player.color
    }) : null

    if (this.clock) {
      const tickNow = () => {
        this.clock && this.clock.tick()
        if (gameApi.playable(this.data)) this.clockTimeoutId = setTimeout(tickNow, 100)
      }
      this.clockTimeoutId = setTimeout(tickNow, 100)
    }

    this.makeCorrespondenceClock()
    if (this.correspondenceClock) this.clockIntervId = setInterval(this.correspondenceClockTick, 6000)

    socket.createGame(
      this.data.url.socket,
      this.data.player.version,
      socketHandler(this, this.onFeatured, this.onUserTVRedirect),
      this.data.url.round,
      this.data.userTV
    )

    document.addEventListener('resume', this.onResume)
    window.plugins.insomnia.keepAwake()

    redraw()
  }

  public goToAnalysis = () => {
    const d = this.data
    router.set(`/analyse/online/${d.game.id}/${boardOrientation(d)}?ply=${this.vm.ply}&curFen=${d.game.fen}`)
  }

  public openUserPopup = (position: string, userId: string) => {
    if (!this.vm.miniUser[position].data) {
      miniUserXhr(userId).then(data => {
        this.vm.miniUser[position].data = data
        redraw()
      })
      .catch(() => {
        this.vm.miniUser[position].showing = false
        redraw()
      })
    }
    this.vm.miniUser[position].showing = true
  }

  public closeUserPopup = (position: string) => {
    this.vm.miniUser[position].showing = false
  }

  public showActions = () => {
    router.backbutton.stack.push(this.hideActions)
    this.vm.showingActions = true
  }

  public hideActions = (fromBB?: string) => {
    if (fromBB !== 'backbutton' && this.vm.showingActions) router.backbutton.stack.pop()
    this.vm.showingActions = false
  }

  public flip = () => {
    this.vm.flip = !this.vm.flip
    if (this.data.tv) {
      if (this.vm.flip) router.set('/tv?flip=1', true)
      else router.set('/tv', true)
      return
    }
    this.chessground.set({
      orientation: boardOrientation(this.data, this.vm.flip)
    })
  }


  public canOfferDraw = () => {
    return gameApi.drawable(this.data) && (this.lastDrawOfferAtPly || -99) < (this.vm.ply - 20)
  }

  public offerDraw = () => {
    if (this.canOfferDraw()) {
      this.lastDrawOfferAtPly = this.vm.ply
      socket.send('draw-yes', null)
    }
  }

  public replaying() {
    return this.vm.ply !== this.lastPly()
  }

  public canDrop = () => {
    return !this.replaying() && gameApi.isPlayerPlaying(this.data)
  }

  public firstPly() {
    return this.data.steps[0].ply
  }

  public lastPly() {
    return this.data.steps[this.data.steps.length - 1].ply
  }

  public plyStep(ply: number) {
    return this.data.steps[ply - this.firstPly()]
  }

  public jump = (ply: number) => {
    if (ply < this.firstPly() || ply > this.lastPly()) return false
    const isFwd = ply > this.vm.ply
    this.vm.ply = ply
    const s = this.plyStep(ply)
    const config: cg.SetConfig = {
      fen: s.fen,
      lastMove: s.uci ? chessFormat.uciToMove(s.uci) : null,
      check: s.check,
      turnColor: this.vm.ply % 2 === 0 ? 'white' : 'black'
    }
    if (!this.replaying()) {
      config.movableColor = gameApi.isPlayerPlaying(this.data) ? this.data.player.color : null
      config.dests = gameApi.parsePossibleMoves(this.data.possibleMoves)
    }
    this.chessground.set(config)
    if (this.replaying()) this.chessground.stop()
    if (s.san && isFwd) {
      if (s.san.indexOf('x') !== -1) sound.throttledCapture()
      else sound.throttledMove()
    }
    return true
  }

  public userJump = (ply: number): void => {
    this.cancelMove()
    this.chessground.selectSquare(null)
    this.jump(ply)
  }

  public jumpNext = () => {
    return this.jump(this.vm.ply + 1)
  }

  public jumpPrev = () => {
    return this.jump(this.vm.ply - 1)
  }

  public jumpFirst = () => {
    return this.jump(this.firstPly())
  }

  public jumpLast = () => {
    return this.jump(this.lastPly())
  }

  public isClockRunning(): boolean {
    return !!this.data.clock && gameApi.playable(this.data) &&
      ((this.data.game.turns - this.data.game.startedAtTurn) > 1 || this.data.clock.running)
  }

  public sendMove(orig: Key, dest: Key, prom?: Role, isPremove: boolean = false) {
    const move = {
      u: orig + dest
    }
    if (prom) {
      move.u += (prom === 'knight' ? 'n' : prom[0])
    }

    if (this.data.pref.submitMove && !isPremove) {
      setTimeout(() => {
        router.backbutton.stack.push(this.cancelMove)
        this.vm.moveToSubmit = move
        redraw()
      }, this.data.pref.animationDuration || 0)
    } else {
      this.socketSendMoveOrDrop(move, isPremove)
      if (this.data.game.speed === 'correspondence' && !hasNetwork()) {
        window.plugins.toast.show('You need to be connected to Internet to send your move.', 'short', 'center')
      }
    }
  }

  public sendNewPiece(role: Role, key: Key, isPredrop: boolean) {
    const drop = {
      role: role,
      pos: key
    }
    if (this.data.pref.submitMove && !isPredrop) {
      setTimeout(() => {
        router.backbutton.stack.push(this.cancelMove)
        this.vm.dropToSubmit = drop
        redraw()
      }, this.data.pref.animationDuration || 0)
    } else {
      this.socketSendMoveOrDrop(drop, isPredrop)
    }
  }

  public cancelMove = (fromBB?: string) => {
    if (fromBB !== 'backbutton') router.backbutton.stack.pop()
    this.vm.moveToSubmit = null
    this.vm.dropToSubmit = null
    this.jump(this.vm.ply)
  }

  public submitMove = (v: boolean) => {
    if (v && (this.vm.moveToSubmit || this.vm.dropToSubmit)) {
      if (this.vm.moveToSubmit) {
        this.socketSendMoveOrDrop(this.vm.moveToSubmit)
      } else if (this.vm.dropToSubmit) {
        this.socketSendMoveOrDrop(this.vm.dropToSubmit)
      }
      if (this.data.game.speed === 'correspondence' && !hasNetwork()) {
        window.plugins.toast.show('You need to be connected to Internet to send your move.', 'short', 'center')
      }
      this.vm.moveToSubmit = null
      this.vm.dropToSubmit = null
    } else {
      this.cancelMove()
    }
  }

  public apiMove(o: MoveOrDrop) {
    const d = this.data
    const playing = gameApi.isPlayerPlaying(d)

    if (playing) this.lastMoveMillis = performance.now()

    d.game.turns = o.ply
    d.game.player = o.ply % 2 === 0 ? 'white' : 'black'
    const playedColor: Color = o.ply % 2 === 0 ? 'black' : 'white'
    const white: Player = d.player.color === 'white' ?  d.player : d.opponent
    const black: Player = d.player.color === 'black' ? d.player : d.opponent
    const activeColor = d.player.color === d.game.player

    if (o.status) {
      d.game.status = o.status
    }

    if (o.winner) {
      d.game.winner = o.winner
    }

    let wDraw = white.offeringDraw
    let bDraw = black.offeringDraw
    if (!wDraw && o.wDraw) {
      sound.dong()
      vibrate.quick()
    }
    if (!bDraw && o.bDraw) {
      sound.dong()
      vibrate.quick()
    }
    white.offeringDraw = o.wDraw
    black.offeringDraw = o.bDraw

    d.possibleMoves = activeColor ? o.dests : undefined
    d.possibleDrops = activeColor ? o.drops : undefined

    if (!this.replaying()) {
      this.vm.ply++

      const enpassantPieces: {[index: string]: Piece | null} = {}
      if (o.enpassant) {
        const p = o.enpassant
        enpassantPieces[p.key] = null
        if (d.game.variant.key === 'atomic') {
          atomic.enpassant(this.chessground, p.key, p.color)
        } else {
          sound.capture()
        }
      }

      const castlePieces: {[index: string]: Piece | null} = {}
      if (o.castle && !this.chessground.state.autoCastle) {
        const c = o.castle
        castlePieces[c.king[0]] = null
        castlePieces[c.rook[0]] = null
        castlePieces[c.king[1]] = {
          role: 'king',
          color: c.color
        }
        castlePieces[c.rook[1]] = {
          role: 'rook',
          color: c.color
        }
      }

      const pieces = Object.assign({}, enpassantPieces, castlePieces)
      const newConf = {
        turnColor: d.game.player,
        dests: playing ?
          gameApi.parsePossibleMoves(d.possibleMoves) : <DestsMap>{},
        check: o.check
      }
      if (isMove(o)) {
        const move = chessFormat.uciToMove(o.uci)
        this.chessground.apiMove(
          move[0],
          move[1],
          pieces,
          newConf
        )
      } else if (isDrop(o)) {
        this.chessground.apiNewPiece(
          {
            role: o.role,
            color: playedColor
          },
          chessFormat.uciToDropPos(o.uci),
          newConf
        )
      }

      if (o.promotion) {
        ground.promote(this.chessground, o.promotion.key, o.promotion.pieceClass)
      }
    }

    if (o.clock) {
      const c = o.clock
      if (this.clock) {
        const delay = (playing && activeColor) ? 0 : (c.lag || 1)
        this.clock.setClock(d, c.white, c.black, delay)
      } else if (this.correspondenceClock) {
        this.correspondenceClock.update(c.white, c.black)
      }
    }

    d.game.threefold = !!o.threefold
    d.steps.push({
      ply: this.lastPly() + 1,
      fen: o.fen,
      san: o.san,
      uci: o.uci,
      check: o.check,
      crazy: o.crazyhouse
    })
    gameApi.setOnGame(d, playedColor, true)

    if (this.data.expiration) {
      if (this.data.steps.length > 2) this.data.expiration = undefined
      else this.data.expiration.movedAt = Date.now()
    }

    if (!this.replaying() && playedColor !== d.player.color &&
      (this.chessground.state.premovable.current || this.chessground.state.predroppable.current)) {
      // atrocious hack to prevent race condition
      // with explosions and premoves
      // https://github.com/ornicar/lila/issues/343
      const premoveDelay = d.game.variant.key === 'atomic' ? 100 : 1
      setTimeout(() => {
        this.chessground.playPremove()
        this.playPredrop()
      }, premoveDelay)
    }

    if (this.data.game.speed === 'correspondence') {
      session.refresh()
      saveOfflineGameData(this.id, this.data)
    }
  }

  public onReload = (rCfg: OnlineGameData) => {
    if (rCfg.steps.length !== this.data.steps.length) {
      this.vm.ply = rCfg.steps[rCfg.steps.length - 1].ply
    }
    if (this.chat) this.chat.onReload(rCfg.chat)
    if (this.data.tv) rCfg.tv = this.data.tv
    if (this.data.userTV) rCfg.userTV = this.data.userTV

    this.setData(rCfg)

    this.makeCorrespondenceClock()
    if (this.clock && this.data.clock) this.clock.setClock(this.data, this.data.clock.white, this.data.clock.black)
    this.lastMoveMillis = undefined
    if (!this.replaying()) ground.reload(this.chessground, this.data, rCfg.game.fen, this.vm.flip)
    redraw()
  }

  public reloadGameData = () => {
    xhr.reload(this).then(this.onReload)
  }

  public endWithData = (o: ApiEnd) => {
    const d = this.data
    d.game.winner = o.winner
    d.game.status = o.status
    d.game.boosted = o.boosted

    // in case game is ended with a draw offer
    d.opponent.offeringDraw = false

    this.userJump(this.lastPly())
    this.chessground.stop()

    if (o.ratingDiff) {
      d.player.ratingDiff = o.ratingDiff[d.player.color]
      d.opponent.ratingDiff = o.ratingDiff[d.opponent.color]
    }
    if (this.clock && o.clock) this.clock.setClock(d, o.clock.wc * .01, o.clock.bc * .01)

    window.plugins.insomnia.allowSleepAgain()
    if (this.data.game.speed === 'correspondence') {
      removeOfflineGameData(this.data.url.round.substr(1))
    }
    if (!this.data.player.spectator) {
      if (d.game.turns > 1) {
        sound.dong()
        vibrate.quick()
        session.backgroundRefresh()
      }

      this.showActions()
      setTimeout(redraw, 1000)
    }
  }

  public goBerserk() {
    throttle((): void => socket.send('berserk'), 500)()
    sound.berserk()
  }

  public setBerserk(color: Color) {
    if (this.vm.goneBerserk[color]) return
    this.vm.goneBerserk[color] = true
    if (color !== this.data.player.color) sound.berserk()
    redraw()
  }

  public toggleBookmark = () => {
    return toggleGameBookmark(this.data.game.id).then(this.reloadGameData)
  }

  public unload() {
    clearTimeout(this.clockTimeoutId)
    clearInterval(this.clockIntervId)
    document.removeEventListener('resume', this.onResume)
    if (this.chat) this.chat.unload()
    if (this.notes) this.notes.unload()
  }

  private makeCorrespondenceClock() {
    if (this.data.correspondence && !this.correspondenceClock)
      this.correspondenceClock = new CorresClockCtrl(
        this.data.correspondence, this.outoftime
      )
  }

  private outoftime = throttle(() => {
    socket.send('flag', this.data.game.player)
  }, 500)

  private correspondenceClockTick = () => {
    if (this.correspondenceClock && gameApi.playable(this.data))
      this.correspondenceClock.tick(this.data.game.player)
  }

  private socketSendMoveOrDrop(moveOrDropReq: MoveRequest | DropRequest, premove = false) {
    const millis = premove ? 0 : this.lastMoveMillis !== undefined ?
      performance.now() - this.lastMoveMillis : undefined

    const opts = {
      ackable: true,
      withLag: !!this.clock && (millis === undefined || !this.isClockRunning()),
      millis
    }

    if (isMoveRequest(moveOrDropReq)) {
      socket.send('move', moveOrDropReq, opts)
    }
    else if (isDropRequest(moveOrDropReq)) {
      socket.send('drop', moveOrDropReq, opts)
    }
  }


  private userMove = (orig: Key, dest: Key, meta: AfterMoveMeta) => {
    const hasPremove = !!meta.premove
    if (!promotion.start(this, orig, dest, hasPremove)) {
      this.sendMove(orig, dest, undefined, hasPremove)
    }
  }

  private onUserNewPiece = (role: Role, key: Key, meta: AfterMoveMeta) => {
    if (!this.replaying() && crazyValid.drop(this.data, role, key, this.data.possibleDrops)) {
      this.sendNewPiece(role, key, !!meta.predrop)
    } else {
      this.jump(this.vm.ply)
    }
  }

  private onMove = (_: Key, dest: Key, capturedPiece?: Piece) => {
    if (capturedPiece) {
      if (this.data.game.variant.key === 'atomic') {
        atomic.capture(this.chessground, dest)
        sound.explosion()
      }
      else {
        sound.capture()
      }
    } else {
      sound.move()
    }

    if (!this.data.player.spectator) {
      vibrate.quick()
    }
  }

  private onNewPiece = () => {
    sound.move()
  }

  private playPredrop() {
    return this.chessground.playPredrop((drop: cg.Drop) => {
      return crazyValid.drop(this.data, drop.role, drop.key, this.data.possibleDrops)
    })
  }

  private onResume = () => {
    // hack to avoid nasty race condition on resume: socket will reconnect with
    // an old version and server will send move event that will be processed after
    // a reload by xhr triggered by same resume event
    // thus we disconnect socket and reconnect it after reloading data in order to
    // have last version
    xhr.reload(this)
    .then(data => {
      socket.setVersion(data.player.version)
      this.onReload(data)
    })
  }

  private setData(cfg: OnlineGameData) {
    if (cfg.expiration) {
      cfg.expiration.movedAt = Date.now() - cfg.expiration.idleMillis
    }
    this.data = cfg
  }
}
