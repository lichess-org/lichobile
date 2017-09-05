import board from './board'
import { initBoard, configureBoard, setNewBoardState } from './configure'
import fen from './fen'
import anim from './anim'
import drag from './drag'

export default function(cfg) {

  this.data = initBoard(cfg)

  this.vm = {
    exploding: null
  }

  this.getFen = function() {
    return fen.write(this.data.pieces)
  }.bind(this)

  this.set = anim(setNewBoardState, this.data)

  this.reconfigure = anim(configureBoard, this.data)

  this.toggleOrientation = anim(board.toggleOrientation, this.data)

  this.setPieces = anim(board.setPieces, this.data)

  // useful for board editor only as a workaround for ios issue
  this.setDragPiece = anim(board.setDragPiece, this.data)

  this.selectSquare = anim(board.selectSquare, this.data, true)

  this.apiMove = anim(function(curData, orig, dest, pieces, config) {
    board.apiMove(curData, orig, dest)

    if (pieces) {
      board.setPieces(curData, pieces)
    }

    setNewBoardState(curData, config)

  }, this.data)

  this.apiNewPiece = anim(function(curData, piece, key, config) {
    board.apiNewPiece(curData, piece, key)
    setNewBoardState(curData, config)

  }, this.data)

  this.playPremove = anim(board.playPremove, this.data)

  this.playPredrop = anim(board.playPredrop, this.data)

  this.cancelPremove = anim(board.unsetPremove, this.data, true)

  this.cancelPredrop = anim(board.unsetPredrop, this.data, true)

  this.setCheck = anim(board.setCheck, this.data, true)

  this.cancelMove = anim(function(d) {
    board.cancelMove(d)
    drag.cancel(d)
  }, this.data, true)

  this.stop = anim(function(d) {
    board.stop(d)
    drag.cancel(d)
  }, this.data, true)

  this.explode = function(keys) {
    if (!this.data.render) return
    const self = this
    self.vm.exploding = {
      stage: 1,
      keys: keys
    }
    self.data.renderRAF()
    setTimeout(() => {
      if (self.vm.exploding) {
        self.vm.exploding.stage = 2
        self.data.renderRAF()
      }
      setTimeout(() => {
        self.vm.exploding = null
        self.data.renderRAF()
      }, 120)
    }, 120)
  }.bind(this)

  // view-only needs only `width` and `height` props
  // manipulables board needs also `top` and `left`
  this.setBounds = function(bounds) {
    this.data.bounds = bounds
  }.bind(this)

  let ttId
  // no need to debounce: resizable only by orientation change
  const onresize = function() {
    if (this.data.element) {
      // yolo
      clearTimeout(ttId)
      ttId = setTimeout(function() {
        this.data.bounds = this.data.element.getBoundingClientRect()
        this.data.renderRAF()
      }.bind(this), 100)
    }
  }.bind(this)

  window.addEventListener('resize', onresize)

  this.unload = function() {
    window.removeEventListener('resize', onresize)
  }
}
