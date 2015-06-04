/** @jsx m */
import menu from '../menu';
import utils from '../../utils';
import helper from '../helper';
import gamesMenu from '../gamesMenu';
import newGameForm from '../newGameForm';
import session from '../../session';
import settings from '../../settings';
import challengesApi from '../../lichess/challenges';
import friendsApi from '../../lichess/friends';
import i18n from '../../i18n';
import friendsPopup from '../friendsPopup';

var widgets = {};

widgets.menuButton = function() {
  return (
    <button key="main-menu" className="fa fa-navicon main_header_button menu_button" config={helper.ontouch(menu.toggle)}>
    </button>
  );
};

widgets.backButton = function(title) {
  return (
    <button key="default-history-backbutton" className="back_button" config={helper.ontouch(utils.backHistory)}>
      <span className="fa fa-arrow-left"/>
      {title ? <div className="title">{title}</div> : null }
    </button>
  );
};

widgets.friendsButton = function() {
  const nbFriends = friendsApi.count();
  const longAction = () => window.plugins.toast.show(i18n('onlineFriends'), 'short', 'top');
  return (
    <button className="main_header_button friends_button" key="friends" data-icon="f"
      config={helper.ontouch(friendsPopup.open, longAction)}
    >
    {nbFriends > 0 ?
      <span className="chip nb_friends">{nbFriends}</span> : null
    }
    </button>
  );
};

widgets.gamesButton = function() {
  let key, action;
  const nbChallenges = challengesApi.count();
  if (session.nowPlaying().length || nbChallenges) {
    key = 'games-menu';
    action = gamesMenu.open;
  } else {
    key = 'new-game-form';
    action = newGameForm.open;
  }
  const myTurns = session.myTurnGames().length;
  const className = [
    'main_header_button',
    'game_menu_button',
    settings.general.theme.board(),
    nbChallenges ? 'new_challenge' : '',
    !utils.hasNetwork() ? 'invisible' : ''
    ].join(' ');
  const longAction = () => window.plugins.toast.show(i18n('nbGamesInPlay', session.nowPlaying().length), 'short', 'top');

  return (
    <button key={key} className={className} config={helper.ontouch(action, longAction)}>
      {!nbChallenges && myTurns ?
        <span className="chip nb_playing">{myTurns}</span> : null
      }
      {nbChallenges ?
        <span className="chip nb_challenges">{nbChallenges}</span> : null
      }
    </button>
  );
};

widgets.headerBtns = function() {
  if (utils.hasNetwork() && session.isConnected() && friendsApi.count())
    return (
      <div className="buttons">
        {widgets.friendsButton()}
        {widgets.gamesButton()}
      </div>
    );
  else
    return widgets.gamesButton();
};

widgets.header = function(title, leftButton) {
  return m('nav', [
    leftButton ? leftButton : widgets.menuButton(),
    title ? m('h1', title) : null,
    widgets.headerBtns()
  ]);
};

widgets.loader = m('div.loader_circles', [1, 2, 3].map(function(i) {
  return m('div.circle_' + i);
}));

widgets.connectingHeader = function(title) {
  return m('nav', [
    widgets.menuButton(),
    m('h1.reconnecting', [
      title ? title : null,
      widgets.loader
    ]),
    widgets.headerBtns()
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
