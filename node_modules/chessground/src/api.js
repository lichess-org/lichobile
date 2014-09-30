var m = require('mithril');

module.exports = function(element, controller, view) {

  var action = function(computation) {
    return function() {
      m.startComputation();
      var result = computation.apply(null, arguments);
      m.endComputation();
      return result;
    };
  };

  return {
    set: action(controller.reconfigure),
    toggleOrientation: action(controller.toggleOrientation),
    getOrientation: controller.getOrientation,
    getPieces: controller.getPieces,
    getFen: controller.getFen,
    dump: function() {
      return controller.data;
    },
    move: action(controller.apiMove),
    setPieces: action(controller.setPieces),
    playPremove: action(controller.playPremove)
  };
};
