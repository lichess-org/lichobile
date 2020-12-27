import * as Tree from './interfaces'
import { Pockets } from '../../../lichess/interfaces/game'

function mainlineChild(node: Tree.Node): Tree.Node | undefined {
  return node.children[0]
}

export function withMainlineChild<T>(node: Tree.Node, f: (node: Tree.Node) => T): T | undefined {
  const next = mainlineChild(node)
  return next ? f(next) : undefined
}

export function findInMainline(fromNode: Tree.Node, predicate: (node: Tree.Node) => boolean): Tree.Node | undefined {
  const findFrom = (node: Tree.Node): Tree.Node | undefined => {
    if (predicate(node)) return node
    return withMainlineChild(node, findFrom)
  }
  return findFrom(fromNode)
}

// returns a list of nodes collected from the original one
export function collect(fromNode: Tree.Node, pickChild: (node: Tree.Node) => Tree.Node | undefined): Tree.Node[] {
  const nodes = [fromNode]
  let n = fromNode, c
  while ((c = pickChild(n))) {
    nodes.push(c)
    n = c
  }
  return nodes
}

function pickFirstChild(node: Tree.Node): Tree.Node | undefined {
  return node.children[0]
}

export function childById(node: Tree.Node, id: string): Tree.Node | undefined {
  return node.children.find(child => child.id === id)
}

export function last(nodeList: Tree.Node[]): Tree.Node | undefined {
  return nodeList[nodeList.length - 1]
}

export function nodeAtPly(nodeList: Tree.Node[], ply: number): Tree.Node | undefined {
  return nodeList.find(node => node.ply === ply)
}

export function takePathWhile(nodeList: Tree.Node[], predicate: (node: Tree.Node) => boolean): Tree.Path {
  let path = ''
  for (const i in nodeList) {
    if (predicate(nodeList[i])) path += nodeList[i].id
    else break
  }
  return path
}

export function removeChild(parent: Tree.Node, id: string): void {
  parent.children = parent.children.filter(n => {
    return n.id !== id
  })
}

export function countChildrenAndComments(node: Tree.Node) {
  const count = {
    nodes: 1,
    comments: (node.comments || []).length
  }
  node.children.forEach(child => {
    const c = countChildrenAndComments(child)
    count.nodes += c.nodes
    count.comments += c.comments
  })
  return count
}

interface Crazy {
  crazy?: {
    pockets: Pockets
  }
}

export function reconstruct(parts: Array<Partial<Tree.Node & Crazy>>): Tree.Node {
  const proot: any = parts[0]
  // adapt to offline format which use crazyhouse field name
  if (proot.crazy !== undefined) {
    proot.crazyhouse = proot.crazy
    proot.crazy = undefined
  }
  proot.id = ''
  const root = proot as Tree.Node
  let node: Tree.Node = root
  for (let i = 1, nb = parts.length; i < nb; i++) {
    const np = parts[i]
    if (np.crazy !== undefined) {
      np.crazyhouse = np.crazy
      np.crazy = undefined
    }
    const n = np as Tree.Node
    if (node.children) node.children.unshift(n)
    else node.children = [n]
    node = n
  }
  node.children = node.children || []
  return root
}

// adds n2 into n1
export function merge(n1: Tree.Node, n2: Tree.Node): void {
  n1.eval = n2.eval
  if (n2.glyphs) n1.glyphs = n2.glyphs
  n2.comments && n2.comments.forEach(c => {
    if (!n1.comments) n1.comments = [c]
    else if (!n1.comments.filter(d => d.text === c.text).length) n1.comments.push(c)
  })
  n2.children.forEach(c => {
    const existing = childById(n1, c.id)
    if (existing) merge(existing, c)
    else n1.children.push(c)
  })
}

export function hasBranching(node: Tree.Node, maxDepth: number): boolean {
  return maxDepth <= 0 || node.children[1] ? true : (
    node.children[0] ? hasBranching(node.children[0], maxDepth - 1) : false
  )
}

export function mainlineNodeList(fromNode: Tree.Node): Tree.Node[] {
  return collect(fromNode, pickFirstChild)
}

export function updateAll(root: Tree.Node, f: (node: Tree.Node) => void): void {
  // applies f recursively to all nodes
  const update = (node: Tree.Node) => {
    f(node)
    node.children.forEach(update)
  }
  update(root)
}

