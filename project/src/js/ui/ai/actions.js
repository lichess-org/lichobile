var utils = require('../../utils');
var i18n = require('../../i18n');
var opposite = require('chessground').util.opposite;
var settings = require('../../settings');
var formWidgets = require('../widget/form');
var widget = require('../widget/common');
var backbutton = require('../../backbutton');
var helper = require('../helper');

function renderEnded(ctrl) {
  var sit = ctrl.root.replay.situation();
  if (sit && sit.checkmate) {
    var result = sit.turnColor === 'white' ? '0-1' : '1-0';
    var status = i18n('checkmate') + '. ' + i18n(sit.color === 'white' ? 'blackIsVictorious' : 'whiteIsVictorious') + '.';
    return m('div.result', [result, m('br'), m('br'), status]);
  }
}

function renderAlways(ctrl) {
  var d = ctrl.root.data;
  return [
    m('div.offline_actions', [
      m('button[data-icon=U]', {
        config: helper.ontouchend(utils.f(ctrl.root.initAs, opposite(d.player.color)))
      }, i18n('createAGame')),
      m('button.fa', {
        className: (window.cordova.platformId === 'android') ? 'fa-share-alt' : 'fa-share',
        config: helper.ontouchend(ctrl.sharePGN)
      }, i18n('sharePGN')),
      m('div.action', m('div.select_input',
        formWidgets.renderSelect('Opponent', 'opponent', settings.ai.availableOpponents, settings.ai.opponent)
      ))
    ])
  ];
}

module.exports = {
  controller: function(root) {
    function open() {
      backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
      isOpen = false;
    }

    var isOpen = false;
    return {
      open: open,
      close: close,
      isOpen: function() {
        return isOpen;
      },
      sharePGN: function() {
        window.plugins.socialsharing.share(root.replay.pgn());
      },
      root: root
    };
  },
  view: function(ctrl) {
    if (ctrl.isOpen())
      return widget.overlayPopup(
        null,
        null, [
          renderEnded(ctrl),
          renderAlways(ctrl)
        ],
        ctrl.isOpen(),
        ctrl.close
      );
  }
};
