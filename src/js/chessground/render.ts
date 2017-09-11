import * as cg from './interfaces'
import { State } from './state'
import * as util from './util'

export function renderBoard(d: State, dom: cg.DOM) {
  const boardElement = dom.board
  const asWhite = d.orientation === 'white'
  const orientationChange = d.prev.orientation && d.prev.orientation !== d.orientation
  d.prev.orientation = d.orientation
  const boundsChange = d.prev.bounds && d.prev.bounds !== dom.bounds
  d.prev.bounds = dom.bounds
  const allChange = boundsChange || orientationChange
  const bounds = dom.bounds
  const pieces = d.pieces
  const anims = d.animation.current && d.animation.current.plan.anims
  const capturedPieces = d.animation.current && d.animation.current.plan.captured
  const squares: Map<Key, string> = computeSquareClasses(d)
  const samePieces: Set<Key> = new Set()
  const sameSquares: Set<Key> = new Set()
  const movedPieces: Map<string, cg.PieceNode[]> = new Map()
  const movedSquares: Map<string, cg.SquareNode[]> = new Map()
  const piecesKeys = Object.keys(pieces) as Array<Key>
  let squareClassAtKey, pieceAtKey, anim, captured, translate
  let mvdset, mvd

  let otbTurnFlipChange, otbModeChange, otbChange = false
  if (d.otb) {
    otbTurnFlipChange = d.prev.turnColor && d.prev.turnColor !== d.turnColor
    otbModeChange = d.prev.otbMode && d.prev.otbMode !== d.otbMode
    d.prev.otbMode = d.otbMode
    d.prev.turnColor = d.turnColor
    otbChange = !!(otbTurnFlipChange || otbModeChange)
  }

  // walk over all board dom elements, apply animations and flag moved pieces
  let el = dom.board.firstChild as cg.KeyedNode
  while (el) {
    let k = el.cgKey
    pieceAtKey = pieces[k]
    squareClassAtKey = squares.get(k)
    anim = anims && anims[k]
    captured = capturedPieces && capturedPieces[k]
    if (isPieceNode(el)) {
      const pieceClass = el.cgRole + el.cgColor
      // if piece not being dragged anymore, remove dragging style
      if (el.cgDragging && (!d.draggable.current || d.draggable.current.orig !== k)) {
        el.classList.remove('dragging')
        el.classList.remove('magnified')
        translate = util.posToTranslate(util.key2pos(k), asWhite, bounds)
        el.style.transform = util.transform(d, el.cgColor, util.translate(translate))
        el.cgDragging = false
      }
      // remove captured class if it still remains
      if (!captured && el.cgCaptured) {
        el.cgCaptured = false
        el.classList.remove('captured')
      }
      // there is now a piece at this dom key
      if (pieceAtKey) {
        // continue animation if already animating and same color
        // (otherwise it could animate a captured piece)
        if (anim && el.cgAnimating && el.cgColor === pieceAtKey.color) {
          translate = util.posToTranslate(util.key2pos(k), asWhite, bounds)
          translate[0] += anim[1][0]
          translate[1] += anim[1][1]
          el.style.transform = util.transform(d, el.cgColor, util.translate(translate))
        } else if (el.cgAnimating) {
          translate = util.posToTranslate(util.key2pos(k), asWhite, bounds)
          el.style.transform = util.transform(d, el.cgColor, util.translate(translate))
          el.cgAnimating = false
        }
        // same piece: flag as same
        if (!allChange && !otbChange && el.cgColor === pieceAtKey.color && el.cgRole === pieceAtKey.role) {
          samePieces.add(k)
        }
        // different piece: flag as moved unless it is a captured piece
        else {
          if (captured && captured.role === el.cgRole && captured.color === el.cgColor) {
            el.classList.add('captured')
            el.cgCaptured = true
          } else {
            movedPieces.set(pieceClass, (movedPieces.get(pieceClass) || []).concat(el))
          }
        }
      }
      // no piece: flag as moved
      else {
        movedPieces.set(pieceClass, (movedPieces.get(pieceClass) || []).concat(el))
      }
    }
    else if (isSquareNode(el)) {
      if (!allChange && squareClassAtKey === el.className) {
        sameSquares.add(k)
      }
      else {
        movedSquares.set(
          el.className,
          (movedSquares.get(el.className) || []).concat(el)
        )
      }
    }
    el = el.nextSibling as cg.KeyedNode
  }

  // walk over all pieces in current set, apply dom changes to moved pieces
  // or append new pieces
  for (let j = 0, jlen = piecesKeys.length; j < jlen; j++) {
    let k = piecesKeys[j] as Key
    let p = pieces[k]
    const pieceClass = p.role + p.color
    anim = anims && anims[k]
    if (!samePieces.has(k)) {
      mvdset = movedPieces.get(pieceClass)
      mvd = mvdset && mvdset.pop()
      // a same piece was moved
      if (mvd) {
        // apply dom changes
        mvd.cgKey = k
        translate = util.posToTranslate(util.key2pos(k), asWhite, bounds)
        if (anim) {
          mvd.cgAnimating = true
          translate[0] += anim[1][0]
          translate[1] += anim[1][1]
        }
        mvd.style.transform = util.transform(d, mvd.cgColor, util.translate(translate))
      }
      // no piece in moved obj: insert the new piece
      else {
        const pe = document.createElement('piece') as cg.PieceNode
        pe.className = pieceClassOf(p)
        pe.cgRole = p.role
        pe.cgColor = p.color
        pe.cgKey = k
        translate = util.posToTranslate(util.key2pos(k), asWhite, bounds)
        if (anim) {
          pe.cgAnimating = true
          translate[0] += anim[1][0]
          translate[1] += anim[1][1]
        }
        pe.style.transform = util.transform(d, p.color, util.translate(translate))
        boardElement.appendChild(pe)
      }
    }
  }

  // walk over all squares in current set, apply dom changes to moved squares
  // or append new squares
  squares.forEach((squareClass: string, k: Key) => {
    if (!sameSquares.has(k)) {
      mvdset = movedSquares.get(squareClass)
      mvd = mvdset && mvdset.pop()
      if (mvd) {
        mvd.cgKey = k
        translate = util.posToTranslate(util.key2pos(k), asWhite, bounds)
        mvd.style.transform = util.translate(translate)
      }
      else {
        const se = document.createElement('square') as cg.SquareNode
        se.className = squareClass
        se.cgKey = k
        se.style.transform = util.translate(util.posToTranslate(util.key2pos(k), asWhite, bounds))
        boardElement.appendChild(se)
      }
    }
  })

  // remove any dom el that remains in the moved sets
  const rmEl = (e: HTMLElement) => boardElement.removeChild(e)
  movedPieces.forEach(els => els.forEach(rmEl))
  movedSquares.forEach(els => els.forEach(rmEl))
}

export function makeCoords(el: HTMLElement, withSymm: boolean) {
  const coords = document.createDocumentFragment()
  coords.appendChild(renderCoords(util.ranks, 'ranks'))
  coords.appendChild(renderCoords(util.files, 'files' + (withSymm ? ' withSymm' : '')))
  el.appendChild(coords)
}

export function makeSymmCoords(el: HTMLElement) {
  const coords = document.createDocumentFragment()
  coords.appendChild(renderCoords(util.invRanks, 'ranks symm'))
  coords.appendChild(renderCoords(util.invFiles, 'files symm'))
  el.appendChild(coords)
}

function isPieceNode(el: cg.PieceNode | cg.SquareNode): el is cg.PieceNode {
  return el.tagName === 'PIECE'
}
function isSquareNode(el: cg.PieceNode | cg.SquareNode): el is cg.SquareNode {
  return el.tagName === 'SQUARE'
}

function pieceClassOf(p: Piece) {
  return p.role + ' ' + p.color
}

function addSquare(squares: Map<Key, string>, key: Key, klass: string) {
  squares.set(key, (squares.get(key) || '') + ' ' + klass)
}

function computeSquareClasses(d: State): Map<Key, string> {
  const squares = new Map()
  if (d.lastMove && d.highlight.lastMove) d.lastMove.forEach((k) => {
    if (k) addSquare(squares, k, 'last-move')
  })

  if (d.check && d.highlight.check) addSquare(squares, d.check, 'check')
  if (d.selected) {
    addSquare(squares, d.selected, 'selected')
    const dests = d.movable.dests && d.movable.dests[d.selected]
    if (dests) dests.forEach((k) => {
      if (d.movable.showDests) addSquare(squares, k, 'move-dest' + (d.pieces[k] ? ' occupied' : ''))
    })
    const pDests = d.premovable.dests
    if (pDests) pDests.forEach((k) => {
      if (d.movable.showDests) addSquare(squares, k, 'premove-dest' + (d.pieces[k] ? ' occupied' : ''))
    })
  }
  const premove = d.premovable.current
  if (premove) premove.forEach((k) => {
    addSquare(squares, k, 'current-premove')
  })

  if (d.exploding) d.exploding.keys.forEach((k) => {
    addSquare(squares, k, 'exploding' + d.exploding!.stage)
  })
  return squares
}

function renderCoords(elems: Array<number | string>, klass: string) {
  const el = document.createElement('li-coords')
  el.className = klass
  elems.forEach((content: number | string, i: number) => {
    const f = document.createElement('li-coord')
    f.className = i % 2 === 0 ? 'coord-odd' : 'coord-even'
    f.textContent = String(content)
    el.appendChild(f)
  })
  return el
}
