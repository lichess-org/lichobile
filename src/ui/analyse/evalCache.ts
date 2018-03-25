import * as throttle from 'lodash/throttle'
import socket from '../../socket'
import { Tree } from '../shared/tree'

export interface CloudEval {
  depth: number
  fen: string
  knodes: number
  path: string
  pvs: ReadonlyArray<{ cp?: number, moves: string, mate?: number }>
  variant?: VariantKey
}

export interface EvalCache {
  onCeval(): void
  fetch(path: Tree.Path, multiPv: number): void
  onCloudEval(cloudEval: CloudEval): void
}

const evalPutMinDepth = 20
const evalPutMinNodes = 3e6
const evalPutMaxMoves = 10

function qualityCheck(ev: Tree.ClientEval): boolean {
  // below 500k nodes, the eval might come from an imminent threefold repetition
  // and should therefore be ignored
  return ev.nodes > 500000 && (
    ev.depth >= evalPutMinDepth || ev.nodes > evalPutMinNodes
  )
}

// from client eval to server eval
function toPutData(variant: VariantKey, ev: Tree.ClientEval): CloudEval {
  const data: Partial<CloudEval> = {
    fen: ev.fen,
    knodes: Math.round(ev.nodes / 1000),
    depth: ev.depth,
    pvs: ev.pvs.map(pv => {
      return {
        cp: pv.cp,
        mate: pv.mate,
        moves: pv.moves.slice(0, evalPutMaxMoves).join(' ')
      }
    })
  }
  if (variant !== 'standard') data.variant = variant
  return data as CloudEval
}

// from server eval to client eval
function toCeval(e: CloudEval): Tree.ClientEval {
  const res: Partial<Tree.ClientEval> = {
    fen: e.fen,
    nodes: e.knodes * 1000,
    depth: e.depth,
    pvs: e.pvs.map(pv => {
      const to: Partial<Tree.PvData> = {
        moves: pv.moves.split(' ')
      }
      if (pv.cp !== undefined) to.cp = pv.cp
      else to.mate = pv.mate
      return to as Tree.PvData
    }),
    cloud: true
  }
  if (res.pvs![0].cp !== undefined) res.cp = res.pvs![0].cp
  else res.mate = res.pvs![0].mate
  res.cloud = true
  return res as Tree.ClientEval
}

export interface Settings {
  variant: VariantKey
  canGet: (node: Tree.Node) => boolean
  canPut: (node: Tree.Node) => boolean
  getNode: () => Tree.Node
  receive: (path: string, ceval?: Tree.ClientEval) => void
}

export function make({
  variant,
  canGet,
  canPut,
  getNode,
  receive
}: Settings): EvalCache {
  const fenFetched: Set<string> = new Set()
  return {
    onCeval: throttle(() => {
      const node = getNode(), ev = node.ceval
      if (ev && !ev.cloud && fenFetched.has(node.fen) && qualityCheck(ev) && canPut(node)) {
        socket.send('evalPut', toPutData(variant, ev))
      }
    }, 500),
    fetch(path: Tree.Path, multiPv: number): void {
      const node = getNode()
      if ((node.ceval && node.ceval.cloud) || !canGet(node)) return
      if (fenFetched.has(node.fen)) return
      fenFetched.add(node.fen)
      const obj: any = {
        fen: node.fen,
        path
      }
      if (variant !== 'standard') obj.variant = variant
      if (multiPv > 1) obj.mpv = multiPv
      socket.send('evalGet', obj)
    },
    onCloudEval(cloudEval): void {
      receive(cloudEval.path, toCeval(cloudEval))
    }
  }
}
