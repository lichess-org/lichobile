var roundView = require('../round/view/roundView');
var layout = require('../layout');
var menu = require('../menu');
var gamesMenu = require('../gamesMenu');
var utils = require('../../utils');

module.exports = function(ctrl) {
  function header() {
    return [
      m('nav', [
        m('button.fa.fa-navicon', { config: utils.ontouchend(menu.toggle) }),
        m('h1.playing', ctrl.round.title),
        m('button.fa.fa-star', {
          config: utils.ontouchend(gamesMenu.open)
        })
      ]),
      m('section.opponent', [
        m('div.infos')
      ])
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
        m('div.reconnecting', 'Reconnecting...')
      ]));

    return els;
  }

  return layout(header, board, footer, menu.view, overlays);
};
