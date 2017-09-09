import * as cg from './interfaces'
import Chessground from './Chessground'
import * as board from './board'
import * as util from './util'
import { anim } from './anim'

export interface DragCurrent {
  orig: Key // orig key of dragging piece
  origPos: cg.Pos
  piece: Piece
  rel: NumberPair // x; y of the piece at original position
  epos: NumberPair // initial event position
  pos: NumberPair // relative current position
  dec: NumberPair // piece center decay
  over: Key | null // square being moused over
  prevOver: Key | null// square previously moused over
  started: boolean // whether the drag has started; as per the distance setting
  draggingPiece: cg.PieceNode | null
  showGhost: boolean // whether to show ghost when dragging
  newPiece?: boolean // it it a new piece from outside the board
  force?: boolean // can the new piece replace an existing one (editor)
  previouslySelected: Key | null
  originTarget: EventTarget,
  scheduledAnimationFrame: boolean
}

function removeDragElements(dom: cg.DOM) {
  if (dom.elements.shadow) {
    dom.elements.shadow.style.transform = util.translate3dAway
  }
  if (dom.elements.ghost) {
    dom.elements.ghost.style.transform = util.translateAway
  }
}

function start(ctrl: Chessground, e: TouchEvent) {
  // support one finger touch only
  if (e.touches && e.touches.length > 1) return
  e.preventDefault()
  const state = ctrl.state
  const dom = ctrl.dom!
  const bounds = dom.bounds
  const position = util.eventPosition(e)
  const orig = board.getKeyAtDomPos(state, position, bounds)
  if (!orig) return
  const previouslySelected = state.selected
  const hadPremove = !!state.premovable.current
  const hadPredrop = !!state.predroppable.current
  if (state.selected && board.canMove(state, state.selected, orig)) {
    anim(s => board.selectSquare(s, orig), ctrl)
  } else {
    board.selectSquare(state, orig)
  }
  const stillSelected = state.selected === orig
  if (state.pieces[orig] && stillSelected && board.isDraggable(state, orig)) {
    const squareBounds = util.computeSquareBounds(state.orientation, bounds, orig)
    const origPos = util.key2pos(orig)
    state.draggable.current = {
      previouslySelected,
      orig,
      piece: state.pieces[orig],
      rel: position,
      epos: position,
      pos: [0, 0],
      origPos,
      dec: state.draggable.magnified ? [
        position[0] - (squareBounds.left + squareBounds.width),
        position[1] - (squareBounds.top + squareBounds.height * 2)
      ] : [
        position[0] - (squareBounds.left + squareBounds.width / 2),
        position[1] - (squareBounds.top + squareBounds.height / 2)
      ],
      started: false,
      over: orig,
      prevOver: null,
      draggingPiece: util.getPieceByKey(dom, orig),
      originTarget: e.target,
      showGhost: state.draggable.showGhost,
      scheduledAnimationFrame: false
    }
    if (state.draggable.magnified && state.draggable.centerPiece) {
      state.draggable.current.dec[1] = position[1] - (squareBounds.top + squareBounds.height)
    }
  } else {
    if (hadPremove) board.unsetPremove(state)
    if (hadPredrop) board.unsetPredrop(state)
  }
  ctrl.redraw()
}

function processDrag(ctrl: Chessground) {
  const state = ctrl.state
  const dom = ctrl.dom!
  const cur = state.draggable.current
  if (!cur) return
  if (cur.scheduledAnimationFrame) return
  cur.scheduledAnimationFrame = true
  requestAnimationFrame(() => {
    const bounds = dom.bounds
    const asWhite = state.orientation === 'white'
    cur.scheduledAnimationFrame = false
    if (cur.orig) {
      // if moving piece is gone, cancel
      if (state.pieces[cur.orig] !== cur.piece) {
        cancel(ctrl)
        return
      }

      // cancel animations while dragging
      if (state.animation.current && state.animation.current.plan.anims[cur.orig]) {
        state.animation.current = null
      }

      const pieceEl = cur.draggingPiece

      if (cur.started && pieceEl) {

        if (!pieceEl.cgDragging) {
          pieceEl.cgDragging = true
          pieceEl.classList.add('dragging')
          if (state.draggable.magnified) {
            pieceEl.classList.add('magnified')
          }
          const ghost = dom.elements.ghost
          if (ghost && cur.showGhost) {
            ghost.className = `ghost ${cur.piece.color} ${cur.piece.role}`
            const translation = util.posToTranslate(
              util.key2pos(cur.orig), state.orientation === 'white', bounds
            )
            ghost.style.transform = util.translate(translation)
          }
        }

        cur.pos = [
          cur.epos[0] - cur.rel[0],
          cur.epos[1] - cur.rel[1]
        ]

        cur.over = board.getKeyAtDomPos(state, cur.epos, bounds)

        // move piece
        const translate = util.posToTranslate(cur.origPos, asWhite, bounds)
        translate[0] += cur.pos[0] + cur.dec[0]
        translate[1] += cur.pos[1] + cur.dec[1]
        pieceEl.style.transform = util.transform(state, cur.piece.color, util.translate3d(translate))

        // move square target
        const shadow = dom.elements.shadow
        if (shadow) {
          if (cur.over && cur.over !== cur.prevOver) {
            const sqSize = bounds.width / 8
            const pos =  util.key2pos(cur.over)
            const translate = util.posToTranslate(pos, asWhite, bounds)
            shadow.style.transform = util.translate3d([
              translate[0] - sqSize / 2,
              translate[1] - sqSize / 2
            ])
          } else if (!cur.over) {
            shadow.style.transform = util.translate3dAway
          }
          cur.prevOver = cur.over
        }
      }
      processDrag(ctrl)
    }
  })
}

function move(ctrl: Chessground, e: TouchEvent) {
  if (e.touches && e.touches.length > 1) return
  const state = ctrl.state

  if (state.draggable.preventDefault) e.preventDefault()

  const cur = state.draggable.current
  if (!cur) return

  if (cur.orig) {
    cur.epos = util.eventPosition(e)
    if (!cur.started && util.distance(cur.epos, cur.rel) >= state.draggable.distance) {
      cur.started = true
      processDrag(ctrl)
    }
  }
}

function end(ctrl: Chessground, e: TouchEvent) {
  const state = ctrl.state
  const dom = ctrl.dom!
  const draggable = state.draggable
  const cur = draggable.current
  if (!cur) return
  // we don't want that end event since the target is different from the drag
  // touchstart
  if (e.type === 'touchend' && cur.originTarget !== e.target &&
    !cur.newPiece) {
    return
  }
  if (state.draggable.preventDefault) {
    e.preventDefault()
  }
  const dest = cur.over
  removeDragElements(dom)
  board.unsetPremove(state)
  board.unsetPredrop(state)
  if (cur.started && dest) {
    if (cur.newPiece) {
      board.dropNewPiece(state, cur.orig, dest)
    }
    else {
      board.userMove(state, cur.orig, dest)
    }
  }
  else if (cur.started && draggable.deleteOnDropOff) {
    delete state.pieces[cur.orig]
    setTimeout(state.events.change, 0)
  }

  if (cur && cur.orig === cur.previouslySelected && (cur.orig === dest || !dest)) {
    board.unselect(state)
  }

  state.draggable.current = null
  ctrl.redraw()
}

function cancel(ctrl: Chessground) {
  const state = ctrl.state
  removeDragElements(ctrl.dom!)
  if (state.draggable.current) {
    state.draggable.current = null
    board.unselect(state)
  }
}

export default {
  start,
  move,
  end,
  cancel,
  processDrag // must be exposed for board editors
}
