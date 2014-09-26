var fen = require('./fen');
var m = require('mithril');

module.exports = function(element, controller, view) {

  var action = function(computation) {
    return function() {
      var result = computation.apply(null, arguments);
      m.render(element, view(controller));
      return result;
    }
  };

  return {
    set: action(controller.reconfigure),
    toggleOrientation: action(controller.toggleOrientation),
    getOrientation: function() {
      return controller.board.orientation;
    },
    getPieces: function() {
      return controller.board.pieces.all;
    },
    getFen: function() {
      return fen.write(controller.board.pieces.all);
    },
    dump: function() {
      return controller.board;
    },
    move: action(controller.apiMove),
    setPieces: action(controller.setPieces),
    playPremove: action(controller.playPremove)
  }
};
