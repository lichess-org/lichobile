import * as last from 'lodash/last'
import Chessground from '../../chessground/Chessground'
import router from '../../router'
import redraw from '../../utils/redraw'
import signals from '../../signals'
import { handleXhrError } from '../../utils'
import sound from '../../sound'
import socket from '../../socket'
import settings from '../../settings'
import { PuzzleData } from '../../lichess/interfaces/training'

import makeGround from './ground'
import makeData from './data'
import chess from './chess'
import menu, { IMenuCtrl } from './menu'
import puzzle from './puzzle'
import * as xhr from './xhr'
import { Data } from './interfaces'

export default class TrainingCtrl {
  data: Data
  menu: IMenuCtrl
  vm: { loading: boolean }
  pieceTheme: string
  chessground: Chessground

  constructor(cfg: PuzzleData) {
    socket.createDefault()

    this.menu = menu.controller(this)
    this.init(cfg)
    setTimeout(this.playInitialMove, 1000)

    this.vm = {
      loading: false
    }

    this.pieceTheme = settings.general.theme.piece()

    signals.afterLogin.add(this.retry)

    window.plugins.insomnia.keepAwake()
  }

  public init = (cfg: PuzzleData) => {
    this.data = makeData(cfg)
    const chessgroundConf = makeGround(this, this.userMove, this.onMove)
    if (this.chessground) this.chessground.reconfigure(chessgroundConf)
    else this.chessground = new Chessground(chessgroundConf)
    redraw()
  }

  public player = (): Color => this.data.puzzle.color

  public revert = (id: number) => {
    if (id !== this.data.puzzle.id) return
    this.chessground.set({
      fen: this.data.chess.fen(),
      lastMove: chess.lastMove(this.data.chess) as KeyPair,
      turnColor: this.data.puzzle.color,
      check: false,
      dests: this.data.chess.dests()
    })
    redraw()
    if (this.data.chess.in_check()) this.chessground.setCheck(true)
  }

  public giveUp = () => {
    this.attempt(false, true)
  }

  public jump = (to: number) => {
    const history = this.data.replay.history
    const step = this.data.replay.step
    const state = this.data.replay.history[to]
    if (!(step !== to && to >= 0 && to < history.length)) return false
    puzzle.jump(this.chessground, this.data, to)
    if (step + 1 === to) {
      if (state.capture) sound.capture()
      else sound.move()
    }
    return true
  }

  public jumpFirst = () => this.jump(0)

  public jumpPrev = () => {
    return this.jump(this.data.replay.step - 1)
  }

  public jumpNext = () => {
    return this.jump(this.data.replay.step + 1)
  }

  public jumpLast = () => {
    this.jump(this.data.replay.history.length - 1)
  }

  public reload = (cfg: PuzzleData) => {
    this.data = makeData(cfg)
    this.chessground.stop()
    puzzle.reload(this.chessground, this.data)
    setTimeout(this.playInitialMove, 1000)
  }

  public newPuzzle = (feedback: boolean) => {
    if (feedback) this.showLoading()
    xhr.newPuzzle()
    .then(cfg => {
      this.init(cfg)
      setTimeout(this.playInitialMove, 1000)
    })
    .then(this.onXhrSuccess)
    .catch(this.onXhrError)
  }

  public loadPuzzle = (id: number) => {
    xhr.loadPuzzle(id)
    .then(cfg => {
      this.init(cfg)
      setTimeout(this.playInitialMove, 1000)
    })
    .then(this.onXhrSuccess)
    .catch(this.onXhrError)
  }

  public retry = router.reload

  public share = () => {
    window.plugins.socialsharing.share(null, null, null, `http://lichess.org/training/${this.data.puzzle.id}`)
  }

  public goToAnalysis = () => {
    const puzzle = this.data.puzzle
    router.set(`/analyse/online/${puzzle.gameId}/${puzzle.color}?ply=${puzzle.initialPly}&curFen=${puzzle.fen}`)
  }

  // --

  private userFinalizeMove = (move: string[], newProgress: any) => {
    chess.move(this.data.chess, move)
    this.data.comment = 'great'
    this.data.progress = newProgress
    this.data.playHistory.push({
      move,
      fen: this.data.chess.fen(),
      dests: this.data.chess.dests(),
      check: this.data.chess.in_check(),
      turnColor: this.data.chess.turn() === 'w' ? 'white' : 'black'
    })
    this.chessground.set({
      fen: this.data.chess.fen(),
      lastMove: [move[0], move[1]] as KeyPair,
      turnColor: this.data.puzzle.opponentColor,
      check: false
    })
    if (this.data.chess.in_check()) this.chessground.setCheck(true)
  }

  private playOpponentMove = (move: KeyPair) => {
    this.onMove(move[0], move[1], this.chessground.state.pieces[move[1]])
    chess.move(this.data.chess, move)
    this.data.playHistory.push({
      move,
      fen: this.data.chess.fen(),
      dests: this.data.chess.dests(),
      check: this.data.chess.in_check(),
      turnColor: this.data.chess.turn() === 'w' ? 'white' : 'black'
    })
    this.chessground.set({
      fen: this.data.chess.fen(),
      lastMove: move,
      dests: this.data.chess.dests(),
      turnColor: this.data.puzzle.color,
      check: false
    })
    if (this.data.chess.in_check()) this.chessground.setCheck(true)
    setTimeout(this.chessground.playPremove, this.chessground.state.animation.duration)
    redraw()
  }

  private playOpponentNextMove = (id: number) => {
    if (id !== this.data.puzzle.id) return
    const move = puzzle.getOpponentNextMove(this.data)
    this.playOpponentMove(puzzle.str2move(move) as KeyPair)
    this.data.progress.push(move)
    if (puzzle.getCurrentLines(this.data) === 'win') {
      setTimeout(() => this.attempt(true), 300)
    }
  }

  private playInitialMove = () => {
    if (this.data.mode !== 'view') {
      this.playOpponentMove(this.data.puzzle.initialMove)
    }
  }

  private showLoading = () => {
    this.vm.loading = true
    redraw()
  }

  private onXhrSuccess = ()  => {
    this.vm.loading = false
    redraw()
  }

  private onXhrError = (res: Error) => {
    this.vm.loading = false
    redraw()
    handleXhrError(res)
  }

  private revertLastMove = () => {
    if (this.data.progress.length === 0) {
      return
    }
    const lastTurnColor = this.data.playHistory[this.data.playHistory.length - 1].turnColor
    const nbPliesToRevert = lastTurnColor === this.data.player.color ? 2 : 1
    this.data.progress = this.data.progress.slice(0, this.data.progress.length - nbPliesToRevert)
    this.data.playHistory = this.data.playHistory.slice(0, this.data.playHistory.length - nbPliesToRevert)
    const sitToRevertTo = this.data.playHistory[this.data.playHistory.length - 1]
    setTimeout(() => {
      this.chessground.set({
        fen: sitToRevertTo.fen,
        lastMove: sitToRevertTo.move,
        turnColor: sitToRevertTo.turnColor,
        check: sitToRevertTo.check,
        movableColor: 'both',
        dests: sitToRevertTo.dests
      })
      redraw()
    }, 1000)
  }

  private attempt = (winFlag: boolean, giveUpFlag: boolean = false) => {
    this.showLoading()
    xhr.attempt(this.data.puzzle.id, winFlag)
    .then(cfg => {
      cfg.progress = this.data.progress
      this.reload(cfg)
      this.onXhrSuccess()
    })
    .catch(() => {
      if (!giveUpFlag) {
        this.revertLastMove()
      }
      const msg = 'Your move has failed to reach lichess server. Please retry to move when the network is back.'
      window.plugins.toast.show(msg, 'long', 'center')
      this.vm.loading = false
      redraw()
    })
  }

  private userMove = (orig: Key, dest: Key) => {
    const res: any = puzzle.tryMove(this.data, [orig, dest])
    const newProgress = res[0]
    const newLines = res[1]
    const lastMove: any = last(newProgress)
    const promotion = lastMove ? lastMove[4] : undefined
    switch (newLines) {
      case 'retry':
        setTimeout(() => this.revert(this.data.puzzle.id), 500)
        this.data.comment = 'retry'
        break
      case 'fail':
        setTimeout(() => {
          if (this.data.mode === 'play') {
            this.chessground.stop()
            this.attempt(false)
          } else {
            this.revert(this.data.puzzle.id)
          }
        }, 500)
        this.data.comment = 'fail'
        break
      default:
        this.userFinalizeMove([orig, dest, promotion], newProgress)
        if (newLines === 'win') {
          this.chessground.stop()
          this.attempt(true)
        } else {
          setTimeout(() => this.playOpponentNextMove(this.data.puzzle.id), 1000)
        }
        break
    }
    redraw()
  }

  private onMove = (_: Key, __: Key, captured?: Piece) => {
    if (captured) sound.capture()
    else sound.move()
  }
}
