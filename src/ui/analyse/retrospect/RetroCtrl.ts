import redraw from '../../../utils/redraw'
import { evalSwings } from '../nodeFinder'
import * as winningChances from '../ceval/winningChances'
import { path as treePath, Tree } from '../../shared/tree'
import { empty } from '../util'

import AnalyseCtrl from '../AnalyseCtrl'

export type Feedback = 'find' | 'eval' | 'win' | 'fail' | 'view'

interface VM {
  current: any,
  feedback: Feedback
}

export interface IRetroCtrl {
  vm: VM
  color: Color
  isPlySolved(ply: number): boolean
  onJump(): void
  jumpToNext(): void
  skip(): void
  viewSolution(): void
  hideComputerLine(node: Tree.Node): boolean
  showBadNode(): void
  onCeval(): void
  onMergeAnalysisData(): void
  isSolving(): boolean
  completion(): [number, number]
  reset(): void
  close(): void
  node(): Tree.Node
}

export default function RetroCtrl(root: AnalyseCtrl): IRetroCtrl {

  const game = root.data.game
  const color = root.bottomColor()
  let candidateNodes: Tree.Node[] = []
  const explorerCancelPlies: number[] = []
  let solvedPlies: number[] = []

  const vm: VM = {
    current: null,
    feedback: 'find'
  }

  function isPlySolved(ply: Ply): boolean {
    return solvedPlies.includes(ply)
  }

  function findNextNode(): Tree.Node | undefined {
    const colorModulo = root.bottomColor() === 'white' ? 1 : 0
    candidateNodes = evalSwings(root.mainline, function(n) {
      return n.ply % 2 === colorModulo && !explorerCancelPlies.includes(n.ply)
    })
    return candidateNodes.find(n => !isPlySolved(n.ply))
  }

  function jumpToNext(): void {
    vm.feedback = 'find'
    const node = findNextNode()
    if (!node) {
      vm.current = null
      return redraw()
    }
    const fault = {
      node,
      path: root.mainlinePathToPly(node.ply)
    }
    const prevPath = treePath.init(fault.path)
    const prev = {
      node: root.tree.nodeAtPath(prevPath),
      path: prevPath
    }
    const solutionNode = prev.node.children.find(n => !!n.comp)
    vm.current = {
      fault,
      prev,
      solution: {
        node: solutionNode,
        path: prevPath + solutionNode!.id
      },
      openingUcis: []
    }
    // fetch opening explorer moves
    if (game.variant.key === 'standard' && game.division && (!game.division.middle || fault.node.ply < game.division.middle)) {
      root.explorer.fetchMasterOpening(prev.node.fen).then((res) => {
        const cur = vm.current
        const ucis: Uci[] = []
        res!.moves.forEach((m) => {
          if (m.white + m.draws + m.black > 1) ucis.push(m.uci)
        })
        if (ucis.find((uci) => {
          return fault.node.uci === uci
        })) {
          explorerCancelPlies.push(fault.node.ply)
          setTimeout(jumpToNext, 100)
        } else {
          cur.openingUcis = ucis
          vm.current = cur
        }
      })
    }
    root.userJump(prev.path)
    redraw()
  }

  function onJump(): void {
    const node = root.node, fb = vm.feedback, cur = vm.current
    if (!cur) return
    if (fb === 'eval' && cur.fault.node.ply !== node.ply) {
      vm.feedback = 'find'
      return
    }
    if (isSolving() && cur.fault.node.ply === node.ply) {
      if (cur.openingUcis.find((uci: Uci) => {
        return node.uci === uci
      })) onWin() // found in opening explorer
      else if (node.comp) onWin() // the computer solution line
      else if (node.eval) onFail() // the move that was played in the game
      else {
        vm.feedback = 'eval'
        if (!root.ceval.enabled()) {
          root.ceval.toggle()
          root.initCeval()
        }
        checkCeval()
      }
    }
  }

  function isCevalReady(node: Tree.Node): boolean {
    return node.ceval ? (
      node.ceval.depth >= 18 ||
      (node.ceval.depth >= 14 && node.ceval.millis > 7000)
    ) : false
  }

  function checkCeval(): void {
    const node = root.node,
      cur = vm.current
    if (!cur || vm.feedback !== 'eval' || cur.fault.node.ply !== node.ply) return
    if (isCevalReady(node)) {
      const diff = winningChances.povDiff(color, node.ceval!, cur.prev.node.eval)
      if (diff > -0.035) onWin()
      else onFail()
    }
  }

  function onWin(): void {
    solveCurrent()
    vm.feedback = 'win'
    redraw()
  }

  function onFail(): void {
    vm.feedback = 'fail'
    const bad = {
      node: root.node,
      path: root.path
    }
    root.userJump(vm.current.prev.path)
    if (!root.tree.pathIsMainline(bad.path) && empty(bad.node.children))
      root.tree.deleteNodeAt(bad.path)
    redraw()
  }

  function viewSolution() {
    vm.feedback = 'view'
    root.userJump(vm.current.solution.path)
    solveCurrent()
  }

  function skip() {
    solveCurrent()
    jumpToNext()
  }

  function solveCurrent() {
    solvedPlies.push(vm.current.fault.node.ply)
  }

  function hideComputerLine(node: Tree.Node): boolean {
    return (node.ply % 2 === 0) !== (color === 'white') && !isPlySolved(node.ply)
  }

  function showBadNode(): Tree.Node | undefined {
    const cur = vm.current
    if (cur && isSolving() && cur.prev.path === root.path) return cur.fault.node
  }

  function isSolving(): boolean {
    const fb = vm.feedback
    return fb === 'find' || fb === 'fail'
  }

  jumpToNext()

  function onMergeAnalysisData() {
    if (isSolving() && !vm.current) jumpToNext()
  }

  return {
    vm,
    color,
    isPlySolved,
    onJump,
    jumpToNext,
    skip,
    viewSolution,
    hideComputerLine,
    showBadNode,
    onCeval: checkCeval,
    onMergeAnalysisData,
    isSolving,
    completion: () => [solvedPlies.length, candidateNodes.length],
    reset() {
      solvedPlies = []
      jumpToNext()
    },
    close: root.toggleRetro,
    node: () => root.node
  }
}
