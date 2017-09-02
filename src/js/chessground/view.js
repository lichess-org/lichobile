import * as Vnode from 'mithril/render/vnode'
import drag from './drag'
import util from './util'

export default function renderBoard(ctrl) {
  return Vnode(
    'div',
    undefined,
    {
      className: [
        'cg-board',
        ctrl.data.viewOnly ? 'view-only' : 'manipulable'
      ].join(' '),
      oncreate: function(vnode) {
        ctrl.data.element = vnode.dom
        ctrl.data.render = function() {
          diffBoard(ctrl)
        }
        ctrl.data.renderRAF = function() {
          ctrl.data.batchRAF(ctrl.data.render)
        }

        if (!ctrl.data.bounds) {
          ctrl.data.bounds = vnode.dom.getBoundingClientRect()
        }

        ctrl.data.render()

        if (!ctrl.data.viewOnly) {
          bindEvents(ctrl, vnode.dom)
        }

        if (!ctrl.data.viewOnly) {
          const shadow = document.createElement('div')
          shadow.className = 'cg-square-target'
          shadow.style.transform = util.translate3dAway
          ctrl.data.element.parentNode.appendChild(shadow)
          ctrl.data.domElements.shadow = shadow
        }

        if (!ctrl.data.viewOnly && ctrl.data.draggable.showGhost) {
          const ghost = document.createElement('piece')
          ghost.className = 'ghost'
          ghost.style.transform = util.translateAway
          ctrl.data.element.parentNode.appendChild(ghost)
          ctrl.data.domElements.ghost = ghost
        }

        if (ctrl.data.coordinates) {
          makeCoords(ctrl.data.element.parentNode, !!ctrl.data.symmetricCoordinates)
          if (ctrl.data.symmetricCoordinates) {
            makeSymmCoords(ctrl.data.element.parentNode)
          }
        }
      }
    },
    [],
    undefined,
    undefined
  )
}

function diffBoard(ctrl) {
  const d = ctrl.data
  const boardElement = d.element
  const asWhite = d.orientation === 'white'
  const orientationChange = d.prevOrientation && d.prevOrientation !== d.orientation
  d.prevOrientation = d.orientation
  const bounds = d.bounds
  const pieces = ctrl.data.pieces
  const anims = ctrl.data.animation.current.anims
  const capturedPieces = ctrl.data.animation.current.capturedPieces
  const squares = computeSquareClassesMap(ctrl)
  const samePieces = new Set()
  const sameSquares = new Set()
  const movedPieces = new Map()
  const movedSquares = new Map()
  const piecesKeys = Object.keys(pieces)
  let el, squareClassAtKey, pieceAtKey, pieceClass, anim, captured, translate
  let mvdset, mvd

  let otbTurnFlipChange, otbModeChange
  if (d.otb) {
    otbTurnFlipChange = d.prevTurnColor && d.prevTurnColor !== d.turnColor
    otbModeChange = d.prevOtbMode && d.prevOtbMode !== d.otbMode
    d.prevOtbMode = d.otbMode
    d.prevTurnColor = d.turnColor
  }

  // walk over all board dom elements, apply animations and flag moved pieces
  el = ctrl.data.element.firstChild
  while (el) {
    let k = el.cgKey
    pieceAtKey = pieces[k]
    squareClassAtKey = squares.get(k)
    pieceClass = el.cgRole + el.cgColor
    anim = anims && anims[k]
    captured = capturedPieces && capturedPieces[k]
    if (el.tagName === 'PIECE') {
      // if piece not being dragged anymore, remove dragging style
      if (el.cgDragging && d.draggable.current.orig !== k) {
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
        if (!orientationChange && !otbTurnFlipChange && !otbModeChange && el.cgColor === pieceAtKey.color && el.cgRole === pieceAtKey.role) {
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
    else if (el.tagName === 'SQUARE') {
      if (!orientationChange && squareClassAtKey === el.className) {
        sameSquares.add(k)
      }
      else {
        movedSquares.set(
          el.className,
          (movedSquares.get(el.className) || []).concat(el)
        )
      }
    }
    el = el.nextSibling
  }

  // walk over all pieces in current set, apply dom changes to moved pieces
  // or append new pieces
  for (let j = 0, jlen = piecesKeys.length; j < jlen; j++) {
    let k = piecesKeys[j]
    let p = pieces[k]
    pieceClass = p.role + p.color
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
        const pe = document.createElement('piece')
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
        pe.style.transform = util.transform(d, pe.color, util.translate(translate))
        boardElement.appendChild(pe)
      }
    }
  }

  // walk over all squares in current set, apply dom changes to moved squares
  // or append new squares
  squares.forEach((v, k) => {
    if (!sameSquares.has(k)) {
      mvdset = movedSquares.get(v)
      mvd = mvdset && mvdset.pop()
      if (mvd) {
        mvd.cgKey = k
        translate = util.posToTranslate(util.key2pos(k), asWhite, bounds)
        mvd.style.transform = util.translate(translate)
      }
      else {
        const se = document.createElement('square')
        se.className = v
        se.cgKey = k
        se.style.transform = util.translate(util.posToTranslate(util.key2pos(k), asWhite, bounds))
        boardElement.appendChild(se)
      }
    }
  })

  // remove any dom el that remains in the moved sets
  const rmEl = e => boardElement.removeChild(e)
  movedPieces.forEach(els => els.forEach(rmEl))
  movedSquares.forEach(els => els.forEach(rmEl))
}

function pieceClassOf(p) {
  return p.role + ' ' + p.color
}

function addSquare(squares, key, klass) {
  squares.set(key, (squares.get(key) || '') + ' ' + klass)
}

function computeSquareClassesMap(ctrl) {
  const d = ctrl.data
  const squares = new Map()
  if (d.lastMove && d.highlight.lastMove) d.lastMove.forEach((k) => {
    if (k) addSquare(squares, k, 'last-move')
  })
  if (d.check && d.highlight.check) addSquare(squares, d.check, 'check')
  if (d.selected) {
    addSquare(squares, d.selected, 'selected')
    const dests = d.movable.dests[d.selected]
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
  else if (d.predroppable.current.key)
    addSquare(squares, d.predroppable.current.key, 'current-premove')

  if (ctrl.vm.exploding) ctrl.vm.exploding.keys.forEach((k) => {
    addSquare(squares, k, 'exploding' + ctrl.vm.exploding.stage)
  })
  return squares
}

function bindEvents(ctrl, el) {
  var onstart = drag.start.bind(undefined, ctrl.data)
  var onmove = drag.move.bind(undefined, ctrl.data)
  var onend = drag.end.bind(undefined, ctrl.data)
  var oncancel = drag.cancel.bind(undefined, ctrl.data)
  el.addEventListener('touchstart', onstart)
  el.addEventListener('touchmove', onmove)
  el.addEventListener('touchend', onend)
  el.addEventListener('touchcancel', oncancel)
}

function renderCoords(elems, klass) {
  const el = document.createElement('li-coords')
  el.className = klass
  elems.forEach(function(content, i) {
    const f = document.createElement('li-coord')
    f.className = i % 2 === 0 ? 'coord-odd' : 'coord-even'
    f.textContent = content
    el.appendChild(f)
  })
  return el
}

function makeCoords(el, withSymm) {
  const coords = document.createDocumentFragment()
  coords.appendChild(renderCoords(util.ranks, 'ranks'))
  coords.appendChild(renderCoords(util.files, 'files' + (withSymm ? ' withSymm' : '')))
  el.appendChild(coords)
}

function makeSymmCoords(el) {
  const coords = document.createDocumentFragment()
  coords.appendChild(renderCoords(util.invRanks, 'ranks symm'))
  coords.appendChild(renderCoords(util.invFiles, 'files symm'))
  el.appendChild(coords)
}
