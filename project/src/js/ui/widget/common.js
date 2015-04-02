var menu = require('../menu');
var utils = require('../../utils');
var helper = require('../helper');
var gamesMenu = require('../gamesMenu');
var newGameForm = require('../newGameForm');
var session = require('../../session');
var settings = require('../../settings');

var widgets = {};

widgets.menuButton = function() {
  return m('button.fa.fa-navicon.menu_button', {
    config: helper.ontouchend(menu.toggle)
  });
};

widgets.backButton = function(title) {
  return m('button.fa.fa-arrow-left.back_button', {
    config: helper.ontouchend(utils.backHistory)
  }, title);
};

widgets.gameButton = function() {
  var key, action;
  if (session.nowPlaying().length) {
    key = 'games-menu';
    action = gamesMenu.open;
  } else {
    key = 'new-game-form';
    action = newGameForm.open;
  }
  var myTurns = session.myTurnGames().length;
  return m('button.game_menu_button', {
    key: key,
    className: settings.general.theme.board(),
    config: helper.ontouchend(action)
  }, myTurns ? m('span.nb_playing', myTurns) : null);
};

widgets.header = function(title, leftButton) {
  return m('nav', [
    leftButton ? leftButton : widgets.menuButton(),
    widgets.gameButton(),
    title ? m('h1', title) : null
  ]);
};

widgets.loader = m('div.loader_circles', [1, 2, 3].map(function(i) {
  return m('div.circle_' + i);
}));

widgets.connectingHeader = function() {
  return m('nav', [
    widgets.menuButton(),
    widgets.gameButton(),
    m('h1.reconnecting', [
      widgets.loader
    ])
  ]);
};

widgets.board = function() {
  var x = helper.viewportDim().vw;
  return m('section.board_wrapper', {
    style: {
      height: x + 'px'
    }
  }, helper.viewOnlyBoard(null, null, null, null, settings.general.theme.board(),
    settings.general.theme.piece()));
};

widgets.boardArgs = function(fen, lastMove, orientation, variant, board, piece) {
  var x = helper.viewportDim().vw;
  return m('section.board_wrapper', {
    style: {
      height: x + 'px'
    }
  }, helper.viewOnlyBoard(fen, lastMove, orientation, variant, board, piece));
};

widgets.empty = function() {
  return [];
};

module.exports = widgets;
