var m = require('mithril');

module.exports = function(element, controller, view) {

  return {
    set: controller.reconfigure,
    toggleOrientation: controller.toggleOrientation,
    getOrientation: controller.getOrientation,
    getPieces: controller.getPieces,
    getFen: controller.getFen,
    dump: function() {
      return controller.data;
    },
    move: controller.apiMove,
    setPieces: controller.setPieces,
    setCheck: controller.setCheck,
    playPremove: controller.playPremove
  };
};
