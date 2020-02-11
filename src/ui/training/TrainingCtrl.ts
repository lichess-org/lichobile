import { Plugins } from '@capacitor/core'
import debounce from 'lodash-es/debounce'
import throttle from 'lodash-es/throttle'
import Chessground from '../../chessground/Chessground'
import { build as makeTree, ops as treeOps, path as treePath, TreeWrapper, Tree } from '../shared/tree'
import router from '../../router'
import { ErrorResponse } from '../../http'
import redraw from '../../utils/redraw'
import { hasNetwork, handleXhrError } from '../../utils'
import signals from '../../signals'
import * as chess from '../../chess'
import * as chessFormat from '../../utils/chessFormat'
import session from '../../session'
import sound from '../../sound'
import settings from '../../settings'
import { PuzzleData } from '../../lichess/interfaces/training'
import promotion from '../shared/offlineRound/promotion'
import { PromotingInterface } from '../shared/round'

import moveTest from './moveTest'
import makeGround from './ground'
import menu, { IMenuCtrl } from './menu'
import * as xhr from './xhr'
import { VM, Data, PimpedGame, Feedback } from './interfaces'
import { getUnsolved, syncPuzzleResult, syncAndLoadNewPuzzle, syncAndClearCache, nbRemainingPuzzles, puzzleLoadFailure } from './offlineService'
import { Database } from './database'

export default class TrainingCtrl implements PromotingInterface {
  data!: Data
  menu: IMenuCtrl
  chessground!: Chessground
  database: Database

  // current tree state, cursor, and denormalized node lists
  path!: Tree.Path
  node!: Tree.Node
  nodeList!: Tree.Node[]
  mainline!: Tree.Node[]
  initialPath!: Tree.Path
  initialNode!: Tree.Node

  nbUnsolved!: number

  vm!: VM

  pieceTheme: string

  private tree!: TreeWrapper
  private initialData!: PuzzleData

  constructor(cfg: PuzzleData, database: Database) {
    this.menu = menu.controller(this)
    this.database = database
    this.pieceTheme = settings.general.theme.piece()

    this.init(cfg)

    signals.afterLogin.add(this.retry)
  }

  public player = (): Color => this.data.puzzle.color

  public viewSolution = () => {
    if (!this.vm.canViewSolution) return
    this.sendResult(false)
    this.vm.mode = 'view'
    this.mergeSolution(this.data.puzzle.branch, this.data.puzzle.color)

    // try and play the solution next move
    const next = this.node.children[0]
    if (next && next.puzzle === 'good') this.userJump(this.path + next.id, true)
    else {
      const firstGoodPath = treeOps.takePathWhile(this.mainline, node => {
        return node.puzzle !== 'good'
      })
      if (firstGoodPath) {
        this.userJump(firstGoodPath + this.tree.nodeAtPath(firstGoodPath).children[0].id, true)
      }
    }

    redraw()
  }

  public setPath = (path: Tree.Path): void => {
    this.path = path
    this.nodeList = this.tree.getNodeList(path)
    this.node = treeOps.last(this.nodeList) as Tree.Node
    this.mainline = treeOps.mainlineNodeList(this.tree.root)
  }

  public jump = (path: Tree.Path, withSound = false) => {
    const pathChanged = path !== this.path
    this.setPath(path)
    this.updateBoard()
    if (pathChanged && withSound) {
      if (this.node.san && this.node.san.indexOf('x') !== -1) sound.throttledCapture()
      else sound.throttledMove()
    }
    promotion.cancel(this.chessground)
  }

  public userJump = (path: Tree.Path, withSound: boolean) => {
    this.jump(path, withSound)
  }

  public canGoForward = () => {
    return !this.vm.initializing && this.node.children.length > 0
  }

  public fastforward = () => {
    if (this.node.children.length === 0) return false

    const child = this.node.children[0]
    this.userJump(this.path + child.id, true)
    return true
  }

  public canGoBackward = () => {
    if (this.vm.moveValidationPending) return false
    if (this.path === '') return false
    return true
  }

  public resync = () => {
    const user = session.get()
    if (hasNetwork() && user) {
      if (this.vm.loading) {
        return
      }
      this.vm.loading = true
      redraw()
      const onSuccess = (cfg: PuzzleData) => {
        this.vm.loading = false
        this.init(cfg)
        redraw()
      }
      syncAndClearCache(this.database, user)
      .then(onSuccess)
      .catch(error => {
        this.vm.loading = false
        redraw()
        puzzleLoadFailure(error)
      })
    }
  }

  public rewind = () => {
    if (this.canGoBackward()) {
      this.userJump(treePath.init(this.path), false)
      return true
    }

    return false
  }

  public newPuzzle = () => {
    if (this.vm.loading) {
      return
    }
    this.vm.loading = true
    redraw()

    const onSuccess = (cfg: PuzzleData) => {
      this.vm.loading = false
      this.init(cfg)
      redraw()
    }
    const user = session.get()
    if (user) {
      syncAndLoadNewPuzzle(this.database, user)
      .then(onSuccess)
      .catch(error => {
        this.vm.loading = false
        redraw()
        puzzleLoadFailure(error)
      })
    } else {
      xhr.newPuzzle()
      .then(onSuccess)
      .catch(this.onXhrError)
    }
  }

  public retry = () => {
    if (!this.vm.loading) {
      this.init(this.initialData)
    }
  }

  public upvote = () => {
    this.vote(true)
  }

  public downvote = () => {
    this.vote(false)
  }

  public vote = throttle((v: boolean) => {
    this.vm.voted = v
    xhr.vote(this.data.puzzle.id, v).then((res) => {
      this.vm.vote = res[1]
      redraw()
    })
  }, 1000)

  public getVotes = () => {
    return this.vm.vote
  }

  public share = () => {
    Plugins.LiShare.share({ url: `https://lichess.org/training/${this.data.puzzle.id}` })
  }

  public goToAnalysis = () => {
    const puzzle = this.data.puzzle
    if (hasNetwork()) {
      router.set(`/analyse/online/${puzzle.gameId}/${puzzle.color}?ply=${puzzle.initialPly}&curFen=${this.initialNode.fen}&color=${puzzle.color}&fallback=1`)
    } else {
      router.set(`/analyse/variant/standard/fen/${encodeURIComponent(this.initialNode.fen)}?color=${puzzle.color}&goBack=1`)
    }
  }

  // --

  private init(cfg: PuzzleData) {
    this.initialData = cfg

    router.assignState({ puzzleId: cfg.puzzle.id }, `/training/${cfg.puzzle.id}`)

    this.vm = {
      mode: 'play',
      initializing: true,
      lastFeedback: 'init',
      moveValidationPending: false,
      loading: false,
      canViewSolution: false,
      resultSent: false,
      voted: null,
      vote: cfg.puzzle.vote,
    }

    const user = session.get()
    if (user) {
      nbRemainingPuzzles(this.database, user)
      .then(nb => {
        this.nbUnsolved = nb
        redraw()
      })
    }

    const data = JSON.parse(JSON.stringify(cfg))
    const variant = {
      key: 'standard' as VariantKey
    }
    const pimpedGame: PimpedGame = { ...data.game, variant }
    const pimpedData: Data = { ...data, game: pimpedGame }

    this.data = pimpedData

    this.tree = makeTree(treeOps.reconstruct([
      // make root node with puzzle initial state
      {
        fen: this.data.puzzle.fen,
        ply: this.data.puzzle.initialPly - 1,
        id: ''
      },
      this.data.game.treeParts
    ]))
    this.initialPath = treePath.fromNodeList(treeOps.mainlineNodeList(this.tree.root))
    this.initialNode = this.tree.nodeAtPath(this.initialPath)
    this.setPath(treePath.init(this.initialPath))
    this.updateBoard()

    // play opponent first move with delay
    setTimeout(() => {
      this.jump(this.initialPath, true)
      this.vm.initializing = false
    }, 1000)

    setTimeout(() => {
      this.vm.canViewSolution = true
      redraw()
    }, 5000)

    redraw()
  }

  private updateBoard() {
    const node = this.node
    const color: Color = node.ply % 2 === 0 ? 'white' : 'black'
    const dests = chessFormat.readDests(node.dests)
    const config = {
      fen: node.fen,
      turnColor: color,
      orientation: this.data.puzzle.color,
      movableColor: this.gameOver() ? null : this.data.puzzle.color,
      dests: dests || null,
      check: !!node.check,
      lastMove: node.uci ? chessFormat.uciToMove(node.uci) : null
    }

    if (!this.chessground) {
      this.chessground = new Chessground(makeGround(this, this.userMove))
    } else {
      this.chessground.set(config)
    }

    if (!dests) this.getNodeSituation()
  }

  private getNodeSituation = debounce(() => {
    if (this.node && !this.node.dests) {
      chess.situation({
        variant: this.data.game.variant.key,
        fen: this.node.fen,
        path: this.path
      })
      .then(({ situation, path }) => {
        this.tree.updateAt(path, (node: Tree.Node) => {
          node.dests = situation.dests
          node.end = situation.end
          node.player = situation.player
        })
        if (path === this.path) {
          this.updateBoard()
          redraw()
        }
      })
      .catch(err => console.error('get dests error', err))
    }
  }, 50)

  private gameOver(): boolean {
    if (!this.node) return false
    if (this.vm.mode === 'view') return true
    return !!this.node.end
  }

  private sendMove = (orig: Key, dest: Key, prom?: Role) => {
    const move: chess.MoveRequest = {
      orig,
      dest,
      variant: this.data.game.variant.key,
      fen: this.node.fen,
      path: this.path,
      pgnMoves: this.node.pgnMoves
    }
    if (prom) move.promotion = prom
    this.sendMoveRequest(move, true)
  }

  private sendMoveRequest = (move: chess.MoveRequest, userMove = false) => {
    chess.move(move)
    .then(({ situation, path}) => {
      const node = {
        id: situation.id,
        ply: situation.ply,
        fen: situation.fen,
        uci: situation.uci,
        children: [],
        dests: situation.dests,
        check: situation.check,
        end: situation.end,
        player: situation.player,
        san: situation.san,
        pgnMoves: situation.pgnMoves
      }
      if (path === undefined) {
        console.error('Cannot addNode, missing path', node)
        return
      }
      const newPath = this.tree.addNode(node, path)
      if (!newPath) {
        console.error('Cannot addNode', node, path)
        return
      }
      if (userMove) this.vm.moveValidationPending = true
      this.jump(newPath, !userMove)
      redraw()

      const playedByColor = this.node.ply % 2 === 1 ? 'white' : 'black'
      if (playedByColor === this.data.puzzle.color) {
        const progress = moveTest(
          this.vm.mode, this.node, this.path, this.initialPath, this.nodeList,
          this.data.puzzle
        )
        if (progress) this.applyProgress(progress)
      }
    })
    .catch(err => console.error('send move error', move, err))
  }

  private userMove = (orig: Key, dest: Key, captured?: Piece) => {
    if (captured) sound.capture()
    else sound.move()
    if (!promotion.start(this.chessground, orig, dest, this.sendMove)) {
      this.sendMove(orig, dest)
    }
  }

  private revertUserMove = (path: Tree.Path) => {
    setTimeout(() => {
      this.vm.moveValidationPending = false
      this.userJump(treePath.init(path), false)
      this.tree.deleteNodeAt(path)
      redraw()
    }, 500)
  }

  private applyProgress = (progress: Feedback | chess.MoveRequest) => {
    if (progress === 'fail') {
      this.vm.lastFeedback = 'fail'
      this.revertUserMove(this.path)
      if (this.vm.mode === 'play') {
        this.vm.canViewSolution = true
        this.vm.mode = 'try'
        this.sendResult(false)
      }
    } else if (progress === 'retry') {
      this.vm.lastFeedback = 'retry'
      this.revertUserMove(this.path)
    } else if (progress === 'win') {
      this.vm.moveValidationPending = false
      if (this.vm.mode !== 'view') {
        if (this.vm.mode === 'play') this.sendResult(true)
        this.vm.lastFeedback = 'win'
        this.vm.mode = 'view'
      }
    } else if (isMoveRequest(progress)) {
      this.vm.moveValidationPending = false
      this.vm.lastFeedback = 'good'
      setTimeout(() => {
        // play opponent move
        this.sendMoveRequest(progress)
      }, 500)
    }
  }

  private mergeSolution(solution: Tree.Node, color: Color) {

    treeOps.updateAll(solution, (node) => {
      if ((color === 'white') === (node.ply % 2 === 1)) node.puzzle = 'good'
    })

    const solutionNode = treeOps.childById(this.initialNode, solution.id)

    if (solutionNode) treeOps.merge(solutionNode, solution)
    else this.initialNode.children.push(solution)
  }

  private sendResult = (win: boolean) => {
    if (this.vm.resultSent) return
    this.vm.resultSent = true
    const user = session.get()
    const outcome = { id: this.data.puzzle.id, win }

    const roundReq = () => {
      xhr.round(outcome)
      .then((res) => {
        this.vm.voted = res.voted
        this.data.user = res.user
        redraw()
      })
      .catch(err => {
        if (hasNetwork()) {
          handleXhrError(err)
        }
        this.vm.resultSent = false
      })
    }

    if (user) {
      getUnsolved(this.database, user)
      .then(puzzles => {
        // if puzzle is in the unsolved queue let's sync it using batch endpoint
        // a puzzle may have been loaded from database, or from xhr if it has
        // been loaded by id
        if (puzzles.find(p => p.puzzle.id === this.data.puzzle.id)) {
          syncPuzzleResult(this.database, user, outcome)
          .then(newData => {
            if (newData && newData.user) {
              this.data.user = newData.user
              redraw()
            }
          })
        } else {
          roundReq()
        }
      })
    } else {
      roundReq()
    }

  }

  private onXhrError = (res: ErrorResponse) => {
    this.vm.loading = false
    redraw()
    handleXhrError(res)
  }
}

function isMoveRequest(v: Feedback | chess.MoveRequest): v is chess.MoveRequest {
  return (v as chess.MoveRequest).variant !== undefined
}
