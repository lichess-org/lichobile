var menu = require('./menu');
var utils = require('../utils');
var gamesMenu = require('./gamesMenu');

var widgets = {};

widgets.header = function() {
  return m('nav', [
    m('button.fa.fa-navicon.menu', {
      config: utils.ontouchend(menu.toggle)
    }),
    m('button.game-menu', {
      config: utils.ontouchend(gamesMenu.open)
    }),
    m('h1', 'lichess.org')
  ]);
};

widgets.board = function() {
  var x = utils.getViewportDims().vw;
  return m('section.board_wrapper', {
    style: {
      height: x + 'px'
    }
  }, [utils.viewOnlyBoard()]);
};

widgets.empty = function() {
  return [];
};

module.exports = widgets;
