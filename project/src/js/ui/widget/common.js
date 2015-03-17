var menu = require('../menu');
var utils = require('../../utils');
var helper = require('../helper');
var gamesMenu = require('../gamesMenu');
var layout = require('../layout');
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
  var myTurns = session.myTurnGames().length;
  return m('button.game_menu_button', {
    config: helper.ontouchend(gamesMenu.open)
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

widgets.overlayPopup = function(header, content, isShowing, closef) {
  if (!isShowing) return null;
  return m('div.overlay.popup.popup_container', {
    config: helper.fadesIn
  }, [
    m('div.popup_overlay_close', {
      config: helper.ontouchend(helper.fadesOutPopup(closef))
    }),
    m('div#player_controls.overlay_popup', [
      header ? m('header', header) : null,
      m('div.popup_content', content)
    ])
  ]);
};

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

widgets.startBoardView = function() {
  return layout.board(utils.partialf(widgets.header, 'lichess.org'), widgets.board, widgets.empty, menu.view);
};

module.exports = widgets;
