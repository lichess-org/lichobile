import menu from '../menu';
import * as utils from '../../utils';
import helper from '../helper';
import gamesMenu from '../gamesMenu';
import newGameForm from '../newGameForm';
import settings from '../../settings';
import session from '../../session';
import challengesApi from '../../lichess/challenges';
import timeline from '../../lichess/timeline';
import friendsApi from '../../lichess/friends';
import i18n from '../../i18n';
import popupWidget from './popup';
import { getLanguageNativeName } from '../../utils/langs';
import friendsPopup from '../friendsPopup';
import timelineModal from '../timelineModal';
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

export function timelineButton() {
  const unreadCount = timeline.unreadCount();
  const longAction = () => window.plugins.toast.show(i18n('timline'), 'short', 'top');
  return (
    <button className="main_header_button timeline_button fa fa-bell" key="timeline"
      config={helper.ontouch(timelineModal.open, longAction)}
    >
      <span className="chip nb_timeline">{unreadCount}</span>
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
  const nbChallenges = challengesApi.all().length;
  const nbIncomingChallenges = challengesApi.incoming().length;
  const withOfflineGames = !utils.hasNetwork() && utils.getOfflineGames().length;
  if (session.nowPlaying().length || nbChallenges || withOfflineGames) {
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
    nbIncomingChallenges ? 'new_challenge' : '',
    !utils.hasNetwork() && utils.getOfflineGames().length === 0 ? 'invisible' : ''
    ].join(' ');
  const longAction = () => window.plugins.toast.show(i18n('nbGamesInPlay', session.nowPlaying().length), 'short', 'top');

  return (
    <button key={key} className={className} config={helper.ontouch(action, longAction)}>
      {!nbIncomingChallenges && myTurns ?
        <span className="chip nb_playing">{myTurns}</span> : null
      }
      {nbIncomingChallenges ?
        <span className="chip nb_challenges">{nbChallenges}</span> : null
      }
    </button>
  );
}

export function headerBtns() {
  if (utils.hasNetwork() && session.isConnected() && friendsApi.count()
    && timeline.unreadCount()) {
    return (
      <div key="buttons" className="buttons">
        {timelineButton()}
        {friendsButton()}
        {gamesButton()}
      </div>
    );
  }
  else if (utils.hasNetwork() && session.isConnected() && friendsApi.count()) {
    return (
      <div key="buttons" className="buttons">
        {friendsButton()}
        {gamesButton()}
      </div>
    );
  }
  else {
    return (
      <div key="buttons" className="buttons">
        {gamesButton()}
      </div>
    );
  }
}

export function header(title, leftButton) {
  return (
    <nav>
      {leftButton ? leftButton : menuButton()}
      {title ? <h1 key="title">{title}</h1> : null}
      {headerBtns()}
    </nav>
  );
}

export const loader = (
  <div className="loader_circles">
    {[1, 2, 3].map(i => <div className={'circle_' + i} />)}
  </div>
);

export function connectingHeader(title) {
  return (
    <nav>
      {menuButton()}
      <h1 key="title" className={'reconnecting' + (title ? 'withTitle' : '')}>
        {title ? <span>{title}</span> : null}
        {loader}
      </h1>
      {headerBtns()}
    </nav>
  );
}

export function viewOnlyBoardContent(fen, lastMove, orientation, variant, wrapperClass, customPieceTheme) {
  const isPortrait = helper.isPortrait();
  const { vw, vh } = helper.viewportDim();
  const boardStyle = isPortrait ? { width: vw + 'px', height: vw + 'px' } : {};
  const boardKey = 'viewonlyboard' + (isPortrait ? 'portrait' : 'landscape');
  const bounds = isPortrait ? { width: vw, height: vw } : { width: vh - 50, height: vh - 50 };
  const className = 'board_wrapper' + (wrapperClass ? ' ' + wrapperClass : '');
  const board = (
    <section key={boardKey} className={className} style={boardStyle}>
    {m.component(ViewOnlyBoard, {bounds, fen, lastMove, orientation, variant, customPieceTheme})}
    </section>
  );
  if (isPortrait) {
    return [
      <section key="viewonlyOpponent" className="playTable">&nbsp;</section>,
      board,
      <section key="viewonlyPlayer" className="playTable">&nbsp;</section>,
      <section key="viewonlyActions" className="actions_bar">&nbsp;</section>
    ];
  } else {
    return [
      board,
      <section key="viewonlyTable" className="table" />
    ];
  }
}

export function empty() {
  return [];
}

export function pad(num, size) {
    var s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
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

export function userPopup(user, isOpen, close) {
  const status = user.online ? 'online' : 'offline';

  function content() {
    return (
      <div className="miniUser">
        <div className="title">
          <div className="username" config={helper.ontouch(() => m.route(`/@/${user.username}`))}>
            <span className={'userStatus ' + status} data-icon="r" />
            {i18n(user.username)}
          </div>
          {user.language ?
            <p className="language withIcon">
              <span className="fa fa-comment-o" />
              {getLanguageNativeName(user.language)}
            </p> : null
          }
        </div>
        <div className="perfs">
          {Object.keys(user.perfs).map(p => {
            return (
              <div className="perf">
                <span data-icon={utils.gameIcon(p)} />
                {user.perfs[p].rating}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return popupWidget(
    'miniUserInfos',
    null,
    content,
    isOpen,
    close
  );
}
