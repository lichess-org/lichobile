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
      return controller.data.orientation;
    },
    getPieces: function() {
      return controller.data.pieces;
    },
    getFen: function() {
      return fen.write(controller.data.pieces.all);
    },
    dump: function() {
      return controller.data;
    },
    move: action(controller.apiMove),
    setPieces: action(controller.setPieces),
    playPremove: action(controller.playPremove)
  }
};
