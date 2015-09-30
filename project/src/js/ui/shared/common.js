import menu from '../menu';
import * as utils from '../../utils';
import helper from '../helper';
import gamesMenu from '../gamesMenu';
import newGameForm from '../newGameForm';
import session from '../../session';
import settings from '../../settings';
import challengesApi from '../../lichess/challenges';
import friendsApi from '../../lichess/friends';
import i18n from '../../i18n';
import friendsPopup from '../friendsPopup';
import m from 'mithril';
import ViewOnlyBoard from './ViewOnlyBoard';


export function menuButton() {
  return (
    <button key="main-menu" className="fa fa-navicon main_header_button menu_button" config={helper.ontouch(menu.toggle)}>
    </button>
  );
}

export function backButton(title) {
  return (
    <button key="default-history-backbutton" className="back_button main_header_button" config={helper.ontouch(utils.backHistory)}>
      <span className="fa fa-arrow-left"/>
      {title ? <div className="title">{title}</div> : null }
    </button>
  );
}

export function friendsButton() {
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
}

export function gamesButton() {
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
}

export function headerBtns() {
  if (utils.hasNetwork() && session.isConnected() && friendsApi.count())
    return (
      <div className="buttons">
        {friendsButton()}
        {gamesButton()}
      </div>
    );
  else
    return gamesButton();
}

export function header(title, leftButton) {
  return m('nav', [
    leftButton ? leftButton : menuButton(),
    title ? m('h1', title) : null,
    headerBtns()
  ]);
}

export const loader = m('div.loader_circles', [1, 2, 3].map(function(i) {
  return m('div.circle_' + i);
}));

export function connectingHeader(title) {
  return m('nav', [
    menuButton(),
    m('h1.reconnecting', {
      className: title ? 'withTitle' : ''
    }, [
      title ? m('span', title) : null,
      loader
    ]),
    headerBtns()
  ]);
}

export function viewOnlyBoardContent(fen, lastMove, orientation, variant) {
  const x = helper.viewportDim().vw;
  const boardStyle = helper.isLandscape() ? {} : { width: x + 'px', height: x + 'px' };
  const boardKey = helper.isLandscape() ? 'landscape' : 'portrait';
  return (
    <div className="content round onlyBoard">
      <section key={boardKey} className="board_wrapper" style={boardStyle}>
        {m.component(ViewOnlyBoard, {fen, lastMove, orientation, variant})}
      </section>
    </div>
  );
}

export function empty() {
  return [];
}

export function userStatus(user) {
  const status = user.online ? 'online' : 'offline';
  return (
    <div className="user">
      <span className={'userStatus ' + status} data-icon="r" />
      {user.title ? <span className="userTitle">{user.title}&nbsp;</span> : null}
      {user.username}
    </div>
  );
}
