import * as treePath from './path'
import * as ops from './ops'
import * as Tree from './interfaces'

export type MaybeNode = Tree.Node | undefined

export interface TreeWrapper {
  root: Tree.Node
  lastNode: () => Tree.Node,
  firstPly(): number
  lastPly(): number
  nodeAtPath(path: Tree.Path): Tree.Node
  getNodeList(path: Tree.Path): Tree.Node[]
  longestValidPath(path: string): Tree.Path
  getOpening(nodeList: Tree.Node[]): Tree.Opening | undefined
  updateAt(path: Tree.Path, update: (node: Tree.Node) => void): MaybeNode
  addNode(node: Tree.Node, path: Tree.Path): Tree.Path | undefined
  addNodes(nodes: Tree.Node[], path: Tree.Path): Tree.Path | undefined
  setShapes(shapes: ReadonlyArray<Tree.Shape>, path: Tree.Path): MaybeNode
  setCommentAt(comment: Tree.Comment, path: Tree.Path): MaybeNode
  deleteCommentAt(id: string, path: Tree.Path): MaybeNode
  setGlyphsAt(glyphs: Tree.Glyph[], path: Tree.Path): MaybeNode
  setClockAt(clock: Tree.Clock | undefined, path: Tree.Path): MaybeNode
  pathIsMainline(path: Tree.Path): boolean
  lastMainlineNode(path: Tree.Path): Tree.Node
  pathExists(path: Tree.Path): boolean
  deleteNodeAt(path: Tree.Path): void
  promoteAt(path: Tree.Path, toMainline: boolean): void
  getCurrentNodesAfterPly(nodeList: Tree.Node[], mainline: Tree.Node[], ply: number): Tree.Node[]
  merge(tree: Tree.Node): void
  removeCeval(): void
  removeComputerVariations(): void
  parentNode(path: Tree.Path): Tree.Node
  getParentClock(node: Tree.Node, path: Tree.Path): Tree.Clock | undefined
}

export function build(root: Tree.Node): TreeWrapper {

  function lastNode(): Tree.Node {
    return ops.findInMainline(root, (node: Tree.Node) => {
      return !node.children.length
    })!
  }

  function nodeAtPath(path: Tree.Path): Tree.Node {
    return nodeAtPathFrom(root, path)
  }

  function nodeAtPathFrom(node: Tree.Node, path: Tree.Path): Tree.Node {
    if (path === '') return node
    const child = ops.childById(node, treePath.head(path))
    return child ? nodeAtPathFrom(child, treePath.tail(path)) : node
  }

  function nodeAtPathOrNull(path: Tree.Path): MaybeNode {
    return nodeAtPathOrNullFrom(root, path)
  }

  function nodeAtPathOrNullFrom(node: Tree.Node, path: Tree.Path): MaybeNode {
    if (path === '') return node
    const child = ops.childById(node, treePath.head(path))
    return child ? nodeAtPathOrNullFrom(child, treePath.tail(path)) : undefined
  }

  function longestValidPathFrom(node: Tree.Node, path: Tree.Path): Tree.Path {
    const id = treePath.head(path)
    const child = ops.childById(node, id)
    return child ? id + longestValidPathFrom(child, treePath.tail(path)) : ''
  }

  function getCurrentNodesAfterPly(nodeList: Tree.Node[], mainline: Tree.Node[], ply: number): Tree.Node[] {
    const nodes = []
    for (const i in nodeList) {
      const node = nodeList[i]
      if (node.ply <= ply && mainline[i].id !== node.id) break
      if (node.ply > ply) nodes.push(node)
    }
    return nodes
  }

  function pathIsMainline(path: Tree.Path): boolean {
    return pathIsMainlineFrom(root, path)
  }

  function pathExists(path: Tree.Path): boolean {
    return !!nodeAtPathOrNull(path)
  }

  function pathIsMainlineFrom(node: Tree.Node, path: Tree.Path): boolean {
    if (path === '') return true
    const pathId = treePath.head(path),
    child = node.children[0]
    if (!child || child.id !== pathId) return false
    return pathIsMainlineFrom(child, treePath.tail(path))
  }

  function lastMainlineNodeFrom(node: Tree.Node, path: Tree.Path): Tree.Node {
    if (path === '') return node
    const pathId = treePath.head(path)
    const child = node.children[0]
    if (!child || child.id !== pathId) return node
    return lastMainlineNodeFrom(child, treePath.tail(path))
  }

  function getNodeList(path: Tree.Path): Tree.Node[] {
    return ops.collect(root, node => {
      const id = treePath.head(path)
      if (id === '') return
      path = treePath.tail(path)
      return ops.childById(node, id)
    })
  }

  function getOpening(nodeList: Tree.Node[]): Tree.Opening | undefined {
    let opening: Tree.Opening | undefined
    nodeList.forEach((node: Tree.Node) => {
      opening = node.opening || opening
    })
    return opening
  }

  function updateAt(path: Tree.Path, update: (node: Tree.Node) => void): MaybeNode {
    const node = nodeAtPathOrNull(path)
    if (node) {
      update(node)
      return node
    }
    return
  }

  // returns new path
  function addNode(node: Tree.Node, path: Tree.Path): Tree.Path | undefined {
    const newPath = path + node.id
    const existing = nodeAtPathOrNull(newPath)
    if (existing) {
      if (node.dests !== undefined && existing.dests === undefined) existing.dests = node.dests
      if (node.drops !== undefined && existing.drops === undefined) existing.drops = node.drops
      return newPath
    }
    return updateAt(path, (parent: Tree.Node) =>
      parent.children.push(node)
    ) ? newPath : undefined
  }

  function addNodes(nodes: Tree.Node[], path: Tree.Path): Tree.Path | undefined {
    const node = nodes[0]
    if (!node) return path
    const newPath = addNode(node, path)
    return newPath ? addNodes(nodes.slice(1), newPath) : undefined
  }

  function deleteNodeAt(path: Tree.Path): void {
    const parent = parentNode(path)
    const id = treePath.last(path)
    ops.removeChild(parent, id)
  }

  function promoteAt(path: Tree.Path, toMainline: boolean): void {
    const nodes = getNodeList(path)
    for (let i = nodes.length - 2; i >= 0; i--) {
      const node = nodes[i + 1]
      const parent = nodes[i]
      if (parent.children[0].id !== node.id) {
        ops.removeChild(parent, node.id)
        parent.children.unshift(node)
        if (!toMainline) break
      }
    }
  }

  function setCommentAt(comment: Tree.Comment, path: Tree.Path) {
    return !comment.text ? deleteCommentAt(comment.id, path) : updateAt(path, (node) => {
      node.comments = node.comments || []
      const existing = node.comments.find((c) => {
        return c.id === comment.id
      })
      if (existing) existing.text = comment.text
      else node.comments.push(comment)
    })
  }

  function deleteCommentAt(id: string, path: Tree.Path) {
    return updateAt(path, (node) => {
      const comments = (node.comments || []).filter((c) => {
        return c.id !== id
      })
      node.comments = comments.length ? comments : undefined
    })
  }

  function setGlyphsAt(glyphs: Tree.Glyph[], path: Tree.Path) {
    return updateAt(path, (node) => {
      node.glyphs = glyphs
    })
  }

  function setClockAt(clock: Tree.Clock | undefined, path: Tree.Path) {
    return updateAt(path, (node) => {
      node.clock = clock
    })
  }

  function parentNode(path: Tree.Path): Tree.Node {
    return nodeAtPath(treePath.init(path))
  }

  function getParentClock(node: Tree.Node, path: Tree.Path): Tree.Clock | undefined {
    if (!('parentClock' in node)) {
      const parent = path && parentNode(path)
      if (!parent) node.parentClock = node.clock
      else if (!('clock' in parent)) node.parentClock = undefined
      else node.parentClock = parent.clock
    }
    return node.parentClock
  }

  return {
    root,
    firstPly(): number {
      return root.ply
    },
    lastPly(): number {
      return lastNode().ply
    },
    lastNode,
    nodeAtPath,
    getNodeList,
    longestValidPath: (path: string) => longestValidPathFrom(root, path),
    getOpening,
    updateAt,
    addNode,
    addNodes,
    setShapes(shapes: ReadonlyArray<Tree.Shape>, path: Tree.Path): MaybeNode {
      return updateAt(path, (node: Tree.Node) => {
        node.shapes = shapes
      })
    },
    setCommentAt,
    deleteCommentAt,
    setGlyphsAt,
    setClockAt,
    pathIsMainline,
    lastMainlineNode(path: Tree.Path): Tree.Node {
      return lastMainlineNodeFrom(root, path)
    },
    pathExists,
    deleteNodeAt,
    promoteAt,
    getCurrentNodesAfterPly,
    merge(tree: Tree.Node) {
      ops.merge(root, tree)
    },
    removeCeval() {
      ops.updateAll(root, (n) => {
        n.ceval = undefined
        n.threat = undefined
      })
    },
    removeComputerVariations() {
      ops.mainlineNodeList(root).forEach(n => {
        n.children = n.children.filter(c => !c.comp)
      })
    },
    parentNode,
    getParentClock
  }
}
