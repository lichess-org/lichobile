var helper = require('../helper');

module.exports = {
  controller: function(getPgn) {
    var isOpen = false;
    return {
      open: function() {
        isOpen = true;
      },
      close: function() {
        isOpen = false;
      },
      isOpen: function() {
        return isOpen;
      },
      copy: function() {
        var text = getPgn();
        window.cordova.plugins.clipboard.copy(text);
        window.plugins.toast.show('PGN copied to clipboard', 'short', 'bottom');
      },
      getPgn: getPgn
    };
  },
  view: function(ctrl) {
    if (ctrl.isOpen()) return m('div.overlay.overlay_scale.open', [
      m('button.overlay_close.fa.fa-close', {
        config: helper.ontouchend(ctrl.close)
      }),
      m('button.overlay_clipboard.fa.fa-copy', {
        config: helper.ontouchend(ctrl.copy)
      }),
      m('div.overlay_content', m.trust(ctrl.getPgn()))
    ]);
  }
};
