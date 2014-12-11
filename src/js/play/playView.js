var roundView = require('../round/roundView');
var layout = require('../layout');
var menu = require('../menu');
var playMenu = require('./playMenu');
var utils = require('../utils');

module.exports = function(ctrl) {
  function header() {
    var children = [
      m('nav', [
        m('a.fa.fa-navicon', { config: utils.ontouchstart(menu.toggle) }),
        ctrl.round ? m('h1.playing', ctrl.round.title) : m('h1', 'lichess.org'),
        m('a.fa.fa-trophy', {
          config: utils.ontouchstart(playMenu.open)
        })
      ])
    ];

    if (ctrl.playing())
      children.push(roundView.renderHeader(ctrl.round));
    else {
      children.push(
        m('section.opponent', [
          m('div.infos', ctrl.vm.isSeekingGame ? [m('h2', 'Waiting for opponent...')] : null)
        ])
      );
    }

    return children;
  }

  function board() {
    if (ctrl.playing())
      return roundView.renderBoard(ctrl.round);
    else
      return roundView.renderBoard(ctrl);
  }

  function footer() {
    if (ctrl.playing()) return [roundView.renderFooter(ctrl.round)];
    else return [m('section.player', [m('div.infos')])];
  }

  return layout(ctrl, header, board, footer, menu.view, utils.partial(playMenu.view, ctrl));
};
