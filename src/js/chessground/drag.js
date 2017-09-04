import board from './board'
import util from './util'
import hold from './hold'

function removeDragElements(data) {
  if (data.domElements.shadow) {
    data.domElements.shadow.style.transform = util.translate3dAway
  }
  if (data.domElements.ghost) {
    data.domElements.ghost.style.transform = util.translateAway
  }
}

function getPieceByKey(data, key) {
  let el = data.element.firstChild
  while (el) {
    if (el.tagName === 'PIECE' && el.cgKey === key) return el
    el = el.nextSibling
  }
  return null
}

function start(data, e) {
  // support one finger touch only
  if (e.touches && e.touches.length > 1) return
  e.preventDefault()
  var previouslySelected = data.selected
  var position = util.eventPosition(e)
  var bounds = data.bounds
  var orig = board.getKeyAtDomPos(data, position, bounds)
  var hadPremove = !!data.premovable.current
  var hadPredrop = !!data.predroppable.current.key
  board.selectSquare(data, orig)
  var stillSelected = data.selected === orig
  if (data.pieces[orig] && stillSelected && board.isDraggable(data, orig)) {
    var squareBounds = util.computeSquareBounds(data.orientation, bounds, orig)
    var origPos = util.key2pos(orig)
    data.draggable.current = {
      previouslySelected: previouslySelected,
      orig: orig,
      piece: data.pieces[orig],
      rel: position,
      epos: position,
      pos: [0, 0],
      origPos: origPos,
      dec: data.draggable.magnified ? [
        position[0] - (squareBounds.left + squareBounds.width),
        position[1] - (squareBounds.top + squareBounds.height * 2)
      ] : [
        position[0] - (squareBounds.left + squareBounds.width / 2),
        position[1] - (squareBounds.top + squareBounds.height / 2)
      ],
      bounds: bounds,
      started: false,
      squareTarget: null,
      draggingPiece: getPieceByKey(data, orig),
      originTarget: e.target,
      scheduledAnimationFrame: false
    }
    if (data.draggable.magnified && data.draggable.centerPiece) {
      data.draggable.current.dec[1] = position[1] - (squareBounds.top + squareBounds.height)
    }
    hold.start()
  } else {
    if (hadPremove) board.unsetPremove(data)
    if (hadPredrop) board.unsetPredrop(data)
  }
  data.renderRAF()
}

function processDrag(data) {
  if (data.draggable.current.scheduledAnimationFrame) return
  data.draggable.current.scheduledAnimationFrame = true
  requestAnimationFrame(function() {
    const cur = data.draggable.current
    const asWhite = data.orientation === 'white'
    cur.scheduledAnimationFrame = false
    if (cur.orig) {
      // if moving piece is gone, cancel
      if (data.pieces[cur.orig] !== cur.piece) {
        cancel(data)
        return
      }

      // cancel animations while dragging
      if (data.animation.current.start &&
        Object.keys(data.animation.current.anims).indexOf(cur.orig) !== -1)
        data.animation.current.start = false

      else if (cur.started) {
        cur.pos = [
          cur.epos[0] - cur.rel[0],
          cur.epos[1] - cur.rel[1]
        ]

        cur.over = board.getKeyAtDomPos(data, cur.epos, cur.bounds)

        // move piece
        var translate = util.posToTranslate(cur.origPos, asWhite, data.bounds)
        translate[0] += cur.pos[0] + cur.dec[0]
        translate[1] += cur.pos[1] + cur.dec[1]
        cur.draggingPiece.style.transform = util.transform(data, cur.piece.color, util.translate3d(translate))

        // move square target
        const shadow = data.domElements.shadow
        if (shadow) {
          if (cur.over && cur.over !== cur.prevTarget) {
            const sqSize = data.bounds.width / 8
            const pos =  util.key2pos(cur.over)
            const translate = util.posToTranslate(pos, asWhite, data.bounds)
            shadow.style.transform = util.translate3d([
              translate[0] - sqSize / 2,
              translate[1] - sqSize / 2
            ])
          } else if (!cur.over) {
            shadow.style.transform = util.translate3dAway
          }
        }
      }
      processDrag(data)
    }
  })
}

function move(data, e) {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  if (data.draggable.preventDefault) e.preventDefault()

  var cur = data.draggable.current
  if (cur.orig) {
    data.draggable.current.epos = util.eventPosition(e)
    if (!cur.started && util.distance(cur.epos, cur.rel) >= data.draggable.distance) {
      cur.started = true
      cur.draggingPiece.classList.add('dragging')
      if (data.draggable.magnified) {
        cur.draggingPiece.classList.add('magnified')
      }
      cur.draggingPiece.cgDragging = true
      const ghost = data.domElements.ghost
      if (ghost) {
        ghost.className = `ghost ${cur.piece.color} ${cur.piece.role}`
        const translation = util.posToTranslate(
          util.key2pos(cur.orig), data.orientation === 'white', data.bounds
        )
        ghost.style.transform = util.translate(translation)
      }
      processDrag(data)
    }
  }
}

function end(data, e) {
  const draggable = data.draggable
  const orig = draggable.current ? draggable.current.orig : null
  if (!orig) return
  // we don't want that end event since the target is different from the drag
  // touchstart
  if (e.type === 'touchend' && draggable.current.originTarget !== e.target &&
    !draggable.current.newPiece) {
    return
  }
  if (data.draggable.preventDefault) {
    e.preventDefault()
  }
  const dest = draggable.current.over
  removeDragElements(data)
  board.unsetPremove(data)
  board.unsetPredrop(data)
  if (draggable.current.started) {
    if (draggable.current.newPiece) {
      board.dropNewPiece(data, orig, dest)
    } else {
      if (orig !== dest) data.movable.dropped = [orig, dest]
      board.userMove(data, orig, dest)
    }
    data.renderRAF()
  } else if (draggable.current.previouslySelected === orig) {
    board.setSelected(data, null)
    data.renderRAF()
  }
  draggable.current = {}
}

function cancel(data) {
  removeDragElements(data)
  if (data.draggable.current.orig) {
    data.draggable.current = {}
    board.selectSquare(data, null)
  }
}

export default {
  getPieceByKey,
  start,
  move,
  end,
  cancel,
  processDrag // must be exposed for board editors
}
