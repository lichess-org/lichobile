import menu from '../menu';
import router from '../../router';
import * as utils from '../../utils';
import { getOfflineGames } from '../../utils/offlineGames';
import layout from '../layout';
import helper from '../helper';
import gamesMenu from '../gamesMenu';
import newGameForm from '../newGameForm';
import settings from '../../settings';
import session from '../../session';
import challengesApi from '../../lichess/challenges';
import friendsApi from '../../lichess/friends';
import i18n from '../../i18n';
import popupWidget from './popup';
import { getLanguageNativeName } from '../../utils/langs';
import friendsPopup from '../friendsPopup';
import m from 'mithril';
import spinner from '../../spinner';
import countries from '../../utils/countries';
import ViewOnlyBoard from './ViewOnlyBoard';

export const LoadingBoard = {
  view() {
    return layout.board(
      connectingHeader,
      viewOnlyBoardContent
    );
  }
};

export function menuButton() {
  return (
    <button key="main-menu" className="fa fa-navicon main_header_button menu_button" oncreate={helper.ontouch(menu.toggle)}>
    </button>
  );
}

export function backButton(title) {
  return (
    <button key="default-history-backbutton" className="back_button main_header_button" oncreate={helper.ontouch(utils.backHistory)}>
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
      oncreate={helper.ontouch(friendsPopup.open, longAction)}
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
  const withOfflineGames = !utils.hasNetwork() && getOfflineGames().length;
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
    !utils.hasNetwork() && getOfflineGames().length === 0 ? 'invisible' : ''
    ].join(' ');
  const longAction = () => window.plugins.toast.show(i18n('nbGamesInPlay', session.nowPlaying().length), 'short', 'top');

  return (
    <button key={key} className={className} oncreate={helper.ontouch(action, longAction)}>
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
  if (utils.hasNetwork() && session.isConnected() && friendsApi.count()) {
    return (
      <div key="buttons" className="buttons">
        {friendsButton()}
        {gamesButton()}
      </div>
    );
  } else if (utils.hasNetwork() && session.isConnected()) {
    return (
      <div key="buttons" className="buttons">
        {gamesButton()}
      </div>
    );
  } else if (utils.hasNetwork() && session.isConnected() && friendsApi.count()) {
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

export function loadingBackbutton(title) {
  return (
    <nav>
      {backButton()}
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
    {m(ViewOnlyBoard, {bounds, fen, lastMove, orientation, variant, customPieceTheme})}
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

export function miniUser(user, mini, isOpen, close) {
  if (!user) return null;

  const status = user.online ? 'online' : 'offline';

  function content() {
    if (!mini) {
      return (
        <div className="miniUser">
          {spinner.getVdom()}
        </div>
      );
    }
    const sessionUserId = session.get() && session.get().id;
    return (
      <div className="miniUser">
        <div className="title">
          <div className="username" oncreate={helper.ontouch(() => router.set(`/@/${user.username}`))}>
            <span className={'userStatus withIcon ' + status} data-icon="r" />
            {i18n(user.username)}
          </div>
          { user.profile && user.profile.country ?
            <p className="country">
              <img className="flag" src={'images/flags/' + user.profile.country + '.png'} />
              {countries[user.profile.country]}
            </p> : user.language ?
              <p className="language">
                <span className="fa fa-comment-o" />
                {getLanguageNativeName(user.language)}
              </p> : null
          }
        </div>
        <div className="mini_perfs">
          {Object.keys(mini.perfs).map(p => {
            const perf = mini.perfs[p];
            return (
              <div className="perf">
                <span data-icon={utils.gameIcon(p)} />
                {perf.games > 0 ? perf.rating + (perf.prov ? '?' : '') : '-'}
              </div>
            );
          })}
        </div>
        { mini.crosstable && mini.crosstable.nbGames > 0 ?
          <div className="yourScore">
            Your score: <span className="score">{`${mini.crosstable.users[sessionUserId]} - ${mini.crosstable.users[user.id]}`}</span>
          </div> : null
        }
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
