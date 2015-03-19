var helper = require('../helper');
var i18n = require('../../i18n');

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
      share: function() {
        var pgn = getPgn();
        var cleanPgn = pgn.replace(/<br\s*[\/]?>/gi, "\r\n");
        window.plugins.socialsharing.share(cleanPgn);
      },
      getPgn: getPgn
    };
  },
  view: function(ctrl) {
    if (ctrl.isOpen()) return m('div.overlay.overlay_scale.open', [
      m('button.overlay_close.fa.fa-close', {
        config: helper.ontouchend(ctrl.close)
      }),
      m('button.overlay_clipboard.fa.fa-share-alt', {
        // [fcalise] - TODO - switch in 'fa-share' for the ios version
        config: helper.ontouchend(ctrl.share)
      }),
      m('div.overlay_content', m.trust(ctrl.getPgn()))
    ]);
  }
};
