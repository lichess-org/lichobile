import board from './board';
import configure from './configure';
import data from './data';
import fen from './fen';
import anim from './anim';
import drag from './drag';

var ttId;

function setNewBoardState(d, config) {
  if (!config) return;

  if (config.fen) {
    d.pieces = fen.read(config.fen);
  }

  if (config.dests) {
    d.movable.dests = config.dests;
  }

  if (config.movableColor) {
    d.movable.color = config.movableColor;
  }

  ['orientation', 'turnColor', 'lastMove', 'check'].forEach(function (prop) {
    if (config.hasOwnProperty(prop)) {
      d[prop] = config[prop];
    }
  });

  if (d.check === true) {
    board.setCheck(d);
  }

  // fix move/premove dests
  if (d.selected) {
    board.setSelected(d, d.selected);
  }

  // forget about the last dropped piece
  d.movable.dropped = [];
}

export default function(cfg) {

  this.data = data(cfg);

  this.vm = {
    exploding: null
  };

  this.getFen = function() {
    return fen.write(this.data.pieces);
  }.bind(this);

  this.set = anim(setNewBoardState, this.data);

  this.reconfigure = anim(configure, this.data);

  this.toggleOrientation = anim(board.toggleOrientation, this.data);

  this.setPieces = anim(board.setPieces, this.data);

  // useful for board editor only as a workaround for ios issue
  this.setDragPiece = anim(board.setDragPiece, this.data);

  this.selectSquare = anim(board.selectSquare, this.data, true);

  this.apiMove = anim(function(curData, orig, dest, pieces, config) {
    board.apiMove(curData, orig, dest);

    if (pieces) {
      board.setPieces(curData, pieces);
    }

    setNewBoardState(curData, config);

  }, this.data);

  this.apiNewPiece = anim(function(curData, piece, key, config) {
    board.apiNewPiece(curData, piece, key);
    setNewBoardState(curData, config);

  }, this.data);

  this.playPremove = anim(board.playPremove, this.data);

  this.playPredrop = anim(board.playPredrop, this.data);

  this.cancelPremove = anim(board.unsetPremove, this.data, true);

  this.cancelPredrop = anim(board.unsetPredrop, this.data, true);

  this.setCheck = anim(board.setCheck, this.data, true);

  this.cancelMove = anim(function(d) {
    board.cancelMove(d);
    drag.cancel(d);
  }, this.data, true);

  this.stop = anim(function(d) {
    board.stop(d);
    drag.cancel(d);
  }, this.data, true);

  this.explode = function(keys) {
    if (!this.data.render) return;
    const self = this;
    self.vm.exploding = {
      stage: 1,
      keys: keys
    };
    self.data.renderRAF();
    setTimeout(() => {
      self.vm.exploding.stage = 2;
      self.data.renderRAF();
      setTimeout(() => {
        self.vm.exploding = null;
        self.data.renderRAF();
      }, 120);
    }, 120);
  }.bind(this);

  // view-only needs only `width` and `height` props
  // manipulables board needs also `top` and `left`
  this.setBounds = function(bounds) {
    this.data.bounds = bounds;
  }.bind(this);

  // no need to debounce: resizable only by orientation change
  var onresize = function() {
    if (this.data.element) {
      // oh my what an ugly hack
      clearTimeout(ttId);
      ttId = setTimeout(function() {
        this.data.bounds = this.data.element.getBoundingClientRect();
      }.bind(this), 100);
    }
  }.bind(this);

  if (!this.data.viewOnly) {
    window.addEventListener('resize', onresize);
  }

  this.unload = function() {
    if (!this.data.viewOnly) {
      window.removeEventListener('resize', onresize);
    }
  };
}
