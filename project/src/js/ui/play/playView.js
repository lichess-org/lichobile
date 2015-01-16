var roundView = require('../round/view/roundView');
var layout = require('../layout');
var menu = require('../menu');
var gamesMenu = require('../gamesMenu');
var utils = require('../../utils');
var i18n = require('../../i18n');

module.exports = function(ctrl) {
  function header() {
    return [
      m('nav', [
        m('button.fa.fa-navicon.menu', { config: utils.ontouchend(menu.toggle) }),
        m('button.game-menu', {
          config: utils.ontouchend(gamesMenu.open)
        }),
        m('h1.playing', ctrl.round.title),
      ]),
      roundView.renderHeader(ctrl.round)
    ];
  }

  function board() {
    return roundView.renderBoard(ctrl.round);
  }

  function footer() {
    return [roundView.renderFooter(ctrl.round)];
  }

  function overlays() {
    var els = [
      gamesMenu.view()
    ];

    if (!ctrl.vm.connectedWS)
      els.push(m('div.overlay', [
        m('div.overlay_content', i18n('reconnecting'))
      ]));

    return els;
  }

  return layout.board(header, board, footer, menu.view, overlays, ctrl.round.data.player.color);
};
