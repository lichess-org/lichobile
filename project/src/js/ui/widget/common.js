/** @jsx m */
var menu = require('../menu');
var utils = require('../../utils');
var helper = require('../helper');
var gamesMenu = require('../gamesMenu');
var newGameForm = require('../newGameForm');
var session = require('../../session');
var settings = require('../../settings');
import challenges from '../../lichess/challenges';

var widgets = {};

widgets.menuButton = function() {
  return (
    <button className="fa fa-navicon menu_button" config={helper.ontouch(menu.toggle)}>
    </button>
  );
};

widgets.backButton = function(title) {
  return (
    <button className="back_button" config={helper.ontouch(utils.backHistory)}>
      <span className="fa fa-arrow-left"/>
      <span className="title">{title}</span>
    </button>
  );
};

widgets.gameButton = function() {
  if (!utils.hasNetwork()) return null;
  var key, action;
  const nbChallenges = challenges.count();
  if (session.nowPlaying().length || nbChallenges) {
    key = 'games-menu';
    action = gamesMenu.open;
  } else {
    key = 'new-game-form';
    action = newGameForm.open;
  }
  const myTurns = session.myTurnGames().length;
  const className = [
    'game_menu_button',
    settings.general.theme.board(),
    nbChallenges ? 'new_challenge' : ''
  ].join(' ');
  return (
    <button key={key} className={className} config={helper.ontouch(action)}>
      {!nbChallenges && myTurns ?
        <span className="chip nb_playing">{myTurns}</span> : null
      }
      {nbChallenges ?
        <span className="chip nb_challenges">{nbChallenges}</span> : null
      }
    </button>
  );
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

widgets.connectingHeader = function(title) {
  return m('nav', [
    widgets.menuButton(),
    widgets.gameButton(),
    m('h1.reconnecting', [
      title ? title : null,
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
