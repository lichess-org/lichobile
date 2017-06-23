import * as debounce from 'lodash/debounce'
import router from '../../router'
import Chessground from '../../chessground/Chessground'
import * as chess from '../../chess'
import * as chessFormat from '../../utils/chessFormat'
import { build as makeTree, path as treePath, ops as treeOps, TreeWrapper, Tree } from '../../utils/tree'
import redraw from '../../utils/redraw'
import session from '../../session'
import sound from '../../sound'
import socket from '../../socket'
import { openingSensibleVariants } from '../../lichess/variant'
import * as gameApi from '../../lichess/game'
import { isOnlineGameData, Opening } from '../../lichess/interfaces/game'
import settings from '../../settings'
import { handleXhrError, oppositeColor, hasNetwork, noop } from '../../utils'
import promotion from '../shared/offlineRound/promotion'
import continuePopup, { Controller as ContinuePopupController } from '../shared/continuePopup'
import { NotesCtrl } from '../shared/round/notes'
import { getPGN } from '../shared/round/roundXhr'
import * as util from './util'
import cevalCtrl from './ceval/cevalCtrl'
import crazyValid from './crazy/crazyValid'
import explorerCtrl from './explorer/explorerCtrl'
import menu from './menu'
import evalSummary from './evalSummaryPopup'
import analyseSettings from './analyseSettings'
import ground from './ground'
import socketHandler from './analyseSocketHandler'
import { VM, AnalysisData, AnalyseDataWithTree, SanToRole, Source, ExplorerCtrlInterface, CevalCtrlInterface, MenuInterface, CevalEmit } from './interfaces'

const sanToRole: SanToRole = {
  P: 'pawn',
  N: 'knight',
  B: 'bishop',
  R: 'rook',
  Q: 'queen'
}

export default class AnalyseCtrl {
  data: AnalysisData
  orientation: Color
  source: Source
  vm: VM
  settings: MenuInterface
  menu: MenuInterface
  continuePopup: ContinuePopupController
  evalSummary: MenuInterface | null
  notes: NotesCtrl | null

  chessground: Chessground.Controller
  ceval: CevalCtrlInterface
  explorer: ExplorerCtrlInterface
  tree: TreeWrapper

  // current tree state, cursor, and denormalized node lists
  path: Tree.Path
  node: Tree.Node
  nodeList: Tree.Node[]
  mainline: Tree.Node[]

  // state flags
  onMainline: boolean = true
  synthetic: boolean // false if coming from a real game
  ongoing: boolean // true if real game is ongoing

  // paths
  initialPath: Tree.Path

  private debouncedExplorerSetStep: () => void

  public static decomposeUci(uci: string): [Key, Key, SanChar] {
    return [<Key>uci.slice(0, 2), <Key>uci.slice(2, 4), <SanChar>uci.slice(4, 5)]
  }

  constructor(data: AnalysisData, source: Source, orientation: Color, shouldGoBack: boolean, ply?: number) {
    this.data = data
    this.orientation = orientation
    this.source = source
    this.synthetic = util.isSynthetic(data)
    this.initialPath = treePath.root

    if (settings.analyse.supportedVariants.indexOf(this.data.game.variant.key) === -1) {
      window.plugins.toast.show(`Analysis board does not support ${this.data.game.variant.name} variant.`, 'short', 'center')
      router.set('/')
    }

    this.tree = makeTree(treeOps.reconstruct(this.data.treeParts))

    this.settings = analyseSettings.controller(this)
    this.menu = menu.controller(this)
    this.continuePopup = continuePopup.controller()

    this.evalSummary = this.data.analysis ? evalSummary.controller(this) : null
    this.notes = session.isConnected() && this.data.game.speed === 'correspondence' ? new NotesCtrl(this.data) : null
    this.ceval = cevalCtrl(this.data.game.variant.key, this.allowCeval(), this.onCevalMsg)
    this.explorer = explorerCtrl(this, true)
    this.debouncedExplorerSetStep = debounce(this.explorer.setStep, this.data.pref.animationDuration + 50)

    const initPly = Number(ply) ||
      (location.hash && parseInt(location.hash.replace(/#/, ''), 10)) ||
      (this.source === 'online' && gameApi.isPlayerPlaying(this.data) ?
        this.tree.lastPly() : this.tree.firstPly())

    const mainline = treeOps.mainlineNodeList(this.tree.root)
    this.initialPath = treeOps.takePathWhile(mainline, n => n.ply <= initPly)
    this.setPath(this.initialPath)

    const gameMoment = window.moment(this.data.game.createdAt)
    this.vm = {
      shouldGoBack,
      formattedDate: gameMoment.format('L LT'),
      cgConfig: undefined,
      variationMenu: undefined,
      flip: false,
      smallBoard: settings.analyse.smallBoard(),
      analysisProgress: false,
      showBestMove: settings.analyse.showBestMove(),
      showComments: settings.analyse.showComments(),
      computingPGN: false,
      replaying: false
    }

    if (this.isRemoteAnalysable()) {
      this.connectGameSocket()
    } else {
      socket.createDefault()
    }

    this.showGround()
    setTimeout(this.debouncedScroll, 250)
    setTimeout(this.initCeval, 1000)
    window.plugins.insomnia.keepAwake()
  }

  setPath = (path: Tree.Path): void => {
    this.path = path
    this.nodeList = this.tree.getNodeList(path)
    this.node = treeOps.last(this.nodeList) as Tree.Node
    this.mainline = treeOps.mainlineNodeList(this.tree.root)
    this.onMainline = this.tree.pathIsMainline(path)
  }

  player = () => {
    return this.data.game.player
  }

  connectGameSocket = () => {
    if (hasNetwork() && isOnlineGameData(this.data)) {
      socket.createGame(
        this.data.url.socket,
        this.data.player.version,
        socketHandler(this),
        this.data.url.round
      )
    }
  }

  flip = () => {
    this.vm.flip = !this.vm.flip
    this.chessground.set({
      orientation: this.vm.flip ? oppositeColor(this.orientation) : this.orientation
    })
  }

  toggleBoardSize = () => {
    const newVal = !this.vm.smallBoard
    settings.analyse.smallBoard(newVal)
    this.vm.smallBoard = newVal
  }

  initCeval = () => {
    if (this.ceval.enabled()) {
      if (this.ceval.isInit()) {
        this.startCeval()
      } else {
        this.ceval.init().then(this.startCeval)
      }
    }
  }

  private startCeval = () => {
    if (this.ceval.enabled() && this.canUseCeval()) {
      this.ceval.start(this.path, this.nodeList)
    }
  }

  private showGround() {
    const node = this.node

    if (this.data.game.variant.key === 'threeCheck' && !node.checkCount) {
      node.checkCount = util.readCheckCount(node.fen)
    }

    const color: Color = node.ply % 2 === 0 ? 'white' : 'black'
    const dests = util.readDests(node.dests)
    const config = {
      fen: node.fen,
      turnColor: color,
      orientation: this.vm.flip ? oppositeColor(this.orientation) : this.orientation,
      movableColor: this.gameOver() ? null : color,
      dests: dests || null,
      check: !!node.check,
      lastMove: node.uci ? chessFormat.uciToMoveOrDrop(node.uci) : null
    }

    this.vm.cgConfig = config
    this.data.game.player = color
    if (!this.chessground) {
      this.chessground = ground.make(this.data, config, this.orientation, this.userMove, this.userNewPiece)
    } else {
      this.chessground.set(config)
    }

    if (!dests) this.getNodeSituation()
  }

  debouncedScroll = debounce(() => util.autoScroll(document.getElementById('replay')), 200)

  private updateHref = debounce(() => {
    const step = this.node
    if (step) {
      try {
        window.history.replaceState(window.history.state, '', '#' + step.ply)
      } catch (e) { console.error(e) }
    }
  }, 750)

  private debouncedStartCeval = debounce(this.startCeval, 800)

  jump = (path: Tree.Path, direction?: 'forward' | 'backward') => {
    this.setPath(path)
    // this.toggleVariationMenu()
    this.showGround()
    this.fetchOpening()
    if (this.node && this.node.san && direction === 'forward') {
      if (this.node.san.indexOf('x') !== -1) sound.throttledCapture()
      else sound.throttledMove()
    }
    this.ceval.stop()
    this.debouncedExplorerSetStep()
    this.updateHref()
    this.debouncedStartCeval()
    promotion.cancel(this.chessground, this.vm.cgConfig)
  }

  userJump = (path: Tree.Path, direction?: 'forward' | 'backward') => {
    this.jump(path, direction)
  }

  private mainlinePathToPly(ply: Ply): Tree.Path {
    return treeOps.takePathWhile(this.mainline, n => n.ply <= ply)
  }

  jumpToMain = (ply: number) => {
    this.userJump(this.mainlinePathToPly(ply))
  }

  jumpToIndex = (index: number) => {
    this.jumpToMain(index + 1 + (this.data.game.startedAtTurn || 0))
  }

  private canGoForward() {
    return this.node.children.length > 0
  }

  private next() {
    if (!this.canGoForward()) return false

    const child = this.node.children[0]
    if (child) this.userJump(this.path + child.id, 'forward')

    return true
  }

  private prev() {
    this.userJump(treePath.init(this.path), 'backward')

    return true
  }

  fastforward = () => {
    this.vm.replaying = true
    const more = this.next()
    if (!more) {
      this.vm.replaying = false
      this.debouncedScroll()
    }
    return more
  }

  stopff = () => {
    this.vm.replaying = false
    this.next()
    this.debouncedScroll()
  }

  rewind = () => {
    this.vm.replaying = true
    const more = this.prev()
    if (!more) {
      this.vm.replaying = false
      this.debouncedScroll()
    }
    return more
  }

  stoprewind = () => {
    this.vm.replaying = false
    this.prev()
    this.debouncedScroll()
  }

  canDrop = () => {
    return true
  }

  private sendMove = (orig: Key, dest: Key, prom?: Role) => {
    const move: chess.MoveRequest = {
      orig,
      dest,
      variant: this.data.game.variant.key,
      fen: this.node.fen,
      path: this.path
    }
    if (prom) move.promotion = prom
    chess.move(move)
    .then(this.addNode)
    .catch(err => console.error('send move error', move, err))
  }

  private userMove = (orig: Key, dest: Key, captured?: Piece) => {
    if (captured) sound.capture()
    else sound.move()
    if (!promotion.start(this.chessground, orig, dest, this.sendMove)) this.sendMove(orig, dest)
  }

  private userNewPiece = (piece: Piece, pos: Key) => {
    if (crazyValid.drop(piece.role, pos, this.node.drops)) {
      sound.move()
      const drop = {
        role: piece.role,
        pos,
        variant: this.data.game.variant.key,
        fen: this.node.fen,
        path: this.path
      }
      chess.drop(drop)
      .then(this.addNode)
      .catch(err => {
        // catching false drops here
        console.error('wrong drop', err)
        this.jump(this.path)
      })
    } else this.jump(this.path)
  }

  explorerMove = (uci: string) => {
    const move = AnalyseCtrl.decomposeUci(uci)
    if (uci[1] === '@') {
      this.chessground.apiNewPiece({
        color: this.chessground.state.movable.color as Color,
        role: sanToRole[uci[0]]
      }, move[1])
    } else if (!move[2]) {
      this.sendMove(move[0], move[1])
    }
    else {
      this.sendMove(move[0], move[1], sanToRole[move[2].toUpperCase()])
    }
    this.explorer.loading(true)
  }

  addNode = ({ situation, path }: chess.MoveResponse) => {
    const curNode = this.node
    const node = {
      // TODO have chess worker return node ids
      id: 'TODO',
      ply: situation.ply,
      fen: situation.fen,
      uci: situation.uciMoves[0],
      children: [],
      dests: situation.dests,
      drops: situation.drops,
      check: situation.check,
      end: situation.end,
      player: situation.player,
      checkCount: situation.checkCount,
      san: situation.pgnMoves[0],
      crazyhouse: situation.crazyhouse,
      pgnMoves: curNode && curNode.pgnMoves ? curNode.pgnMoves.concat(situation.pgnMoves) : undefined
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
    this.jump(newPath)
    this.debouncedScroll()
    redraw()
  }

  // toggleVariationMenu = (path?: Path) => {
  //   this.vm.variationMenu = path
  // }

  // deleteVariation = (path: Path) => {
  //   const ply = path[0].ply
  //   const id = path[0].variation
  //   if (id) {
  //     this.analyse.deleteVariation(ply, id)
  //     if (treePath.contains(path, this.path)) this.jumpToMain(ply - 1)
  //   }
  //   this.toggleVariationMenu()
  // }

  // promoteVariation = (path: Path) => {
  //   const ply = path[0].ply
  //   const id = path[0].variation
  //   if (id) {
  //     this.analyse.promoteVariation(ply, id)
  //     if (treePath.contains(path, this.path)) this.jump(this.path.splice(1))
  //   }
  //   this.toggleVariationMenu()
  // }

  private allowCeval() {
    return (
      this.source === 'offline' || util.isSynthetic(this.data) || !gameApi.playable(this.data)
    ) &&
      gameApi.analysableVariants
      .indexOf(this.data.game.variant.key) !== -1
  }

  private onCevalMsg = (res: CevalEmit) => {
    this.tree.updateAt(res.work.path, (node: Tree.Node) => {
      if (node.ceval && node.ceval.depth >= res.ceval.depth) return

      if (node.ceval === undefined)
        node.ceval = <Tree.ClientEval>Object.assign({}, res.ceval)
      else
        node.ceval = <Tree.ClientEval>Object.assign(node.ceval, res.ceval)

      // get best move in pgn format
      if (node.ceval === undefined || node.ceval.best !== res.ceval.best) {
        if (!res.ceval.best.includes('@')) {
          const move = chessFormat.uciToMove(res.ceval.best)
          chess.move({
            variant: this.data.game.variant.key,
            fen: node.fen,
            orig: move[0],
            dest: move[1],
            promotion: chessFormat.uciToProm(res.ceval.best),
            path: this.path
          })
          .then((data: chess.MoveResponse) => {
            if (node.ceval) node.ceval.bestSan = data.situation.pgnMoves[0]
            if (res.work.path === this.path) {
              redraw()
            }
          })
          .catch((err) => {
            console.error('ceval move err', err)
          })
        }
      }

      if (res.ceval.best.includes('@')) {
        node.ceval.bestSan = res.ceval.best
      }

      redraw()

    })
  }

  gameOver() {
    if (!this.node) return false
    // step.end boolean is fetched async for online games (along with the dests)
    if (this.node.end === undefined) {
      if (this.node.check) {
        const san = this.node.san
        const checkmate = san && san[san.length - 1] === '#'
        return checkmate
      }
    } else {
      return this.node.end
    }
  }

  canUseCeval = () => {
    return !this.gameOver()
  }

  nextNodeBest() {
    return treeOps.withMainlineChild(this.node, (n: Tree.Node) => n.eval ? n.eval.best : undefined)
  }

  hasAnyComputerAnalysis = () => {
    return this.data.analysis || this.ceval.enabled()
  }

  toggleBestMove = () => {
    this.vm.showBestMove = !this.vm.showBestMove
  }

  toggleComments = () => {
    this.vm.showComments = !this.vm.showComments
  }

  sharePGN = () => {
    if (!this.vm.computingPGN) {
      this.vm.computingPGN = true
      if (this.source === 'online') {
        getPGN(this.data.game.id)
        .then((pgn: string) => {
          this.vm.computingPGN = false
          redraw()
          window.plugins.socialsharing.share(pgn)
        })
        .catch(e => {
          this.vm.computingPGN = false
          redraw()
          handleXhrError(e)
        })
      } else {
        const endSituation = this.tree.lastNode()
        const white = this.data.player.color === 'white' ?
        (this.data.game.id === 'offline_ai' ? session.appUser('Anonymous') : 'Anonymous') :
        (this.data.game.id === 'offline_ai' ? this.data.opponent.username : 'Anonymous')
        const black = this.data.player.color === 'black' ?
        (this.data.game.id === 'offline_ai' ? session.appUser('Anonymous') : 'Anonymous') :
        (this.data.game.id === 'offline_ai' ? this.data.opponent.username : 'Anonymous')
        chess.pgnDump({
          variant: this.data.game.variant.key,
          initialFen: this.data.game.initialFen,
          pgnMoves: endSituation.pgnMoves || [],
          white,
          black
        })
        .then((res: chess.PgnDumpResponse) => {
          this.vm.computingPGN = false
          redraw()
          window.plugins.socialsharing.share(res.pgn)
        })
        .catch(e => {
          this.vm.computingPGN = false
          redraw()
          console.error(e)
        })
      }
    }
  }

  isRemoteAnalysable = () => {
    return !this.data.analysis && !this.vm.analysisProgress &&
      session.isConnected() && isOnlineGameData(this.data) &&
      gameApi.analysable(this.data)
  }

  mergeAnalysisData(data: AnalyseDataWithTree): void {
    this.tree.merge(data.tree)
    this.data.analysis = data.analysis
    redraw()
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
          this.showGround()
          redraw()
          if (this.gameOver()) this.ceval.stop()
        }
      })
      .catch(err => console.error('get dests error', err))
    }
  }, 50)

  private fetchOpening = debounce(() => {
    if (
      hasNetwork() && this.node && this.node.opening === undefined &&
      this.node.ply <= 20 && this.node.ply > 0 &&
      openingSensibleVariants.has(this.data.game.variant.key)
    ) {
      let msg: { fen: string, path: string, variant?: VariantKey } = {
        fen: this.node.fen,
        path: this.path
      }
      const variant = this.data.game.variant.key
      if (variant !== 'standard') msg.variant = variant
      this.tree.updateAt(this.path, (node: Tree.Node) => {
        // flag opening as null in any case to not request twice
        node.opening = null
        socket.ask('opening', 'opening', msg)
        .then((d: { opening: Opening, path: string }) => {
          if (d.opening && d.path) {
            node.opening = d.opening
            if (d.path === this.path) redraw()
          }
        })
        .catch(noop)
      })
    }
  }, 50)
}
