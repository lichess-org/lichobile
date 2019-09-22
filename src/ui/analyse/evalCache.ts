import { SocketIFace } from '../../socket'
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
  fetch(path: Tree.Path, multiPv: number): void
  onCloudEval(cloudEval: CloudEval): void
}

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
  getNode: () => Tree.Node
  receive: (path: string, ceval?: Tree.ClientEval) => void
  socketIface: SocketIFace
}

export function make({
  variant,
  canGet,
  getNode,
  receive,
  socketIface
}: Settings): EvalCache {
  const fenFetched: Set<string> = new Set()
  return {
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
      socketIface.send('evalGet', obj)
    },
    onCloudEval(cloudEval): void {
      receive(cloudEval.path, toCeval(cloudEval))
    }
  }
}
