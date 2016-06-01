import menu from '.';
import session from '../../session';
import loginModal from '../loginModal';
import newGameForm from '../newGameForm';
import gamesMenu from '../gamesMenu';
import friendsPopup from '../friendsPopup';
import challengeForm from '../challengeForm';
import i18n from '../../i18n';
import { hasNetwork, getOfflineGames } from '../../utils';
import helper from '../helper';
import friendsApi from '../../lichess/friends';
import Zanimo from 'zanimo';

export default function view() {
  if (!menu.isOpen) return null;

  return (
    <aside id="side_menu" config={slidesInUp}>
      {renderMenu()}
    </aside>
  );
}

function renderHeader(user) {
  return (
    <header className="side_menu_header">
      { session.isKidMode() ? <div className="kiddo">😊</div> : <div className="logo" /> }
      <h2 className="username">
        { hasNetwork() ? user ? user.username : 'Anonymous' : i18n('offline') }
      </h2>
      { hasNetwork() && user ?
        <button className="open_button" data-icon={menu.headerOpen() ? 'S' : 'R'}
          config={helper.ontouch(menu.toggleHeader, null, null, false)}
        /> : null
      }
      { hasNetwork() && !user ?
        <button className="login" config={helper.ontouchY(loginModal.open)}>
          {i18n('signIn')}
        </button> : null
      }
    </header>
  );
}

function renderProfileActions(user) {
  return (
    <ul className="side_links profileActions">
      <li className="side_link" config={helper.ontouch(menu.route('/@/' + user.id))}>
        <span data-icon="r" />
        {i18n('profile')}
      </li>
      <li className="side_link" config={helper.ontouch(menu.popup(friendsPopup.open))}>
        <span data-icon="f" />
        {i18n('onlineFriends') + ` (${friendsApi.count()})`}
      </li>
      <li className="side_link" config={helper.ontouch(menu.route(`/@/${user.id}/following`))}>
        <span className="fa fa-arrow-circle-right" />
        {i18n('nbFollowing', user.nbFollowing || 0)}
      </li>
      <li className="side_link" config={helper.ontouch(menu.route(`/@/${user.id}/followers`))}>
        <span className="fa fa-arrow-circle-left" />
        {i18n('nbFollowers', user.nbFollowers || 0)}
      </li>
      <li className="side_link" config={helper.ontouch(menu.route('/settings/preferences'))}>
        <span data-icon="%" />
        {i18n('preferences')}
      </li>
      <li className="side_link" config={helper.ontouch(() => {
        session.logout();
        menu.headerOpen(false);
      })}>
        <span data-icon="w" />
        {i18n('logOut')}
      </li>
    </ul>
  );
}

function renderLinks(user) {
  const offlineGames = getOfflineGames();

  return (
    <ul className="side_links">
      <li className="side_link" key="home" config={helper.ontouchY(menu.route('/'))}>
        <span className="fa fa-home" />Home
      </li>
      {hasNetwork() ?
      <li className="sep_link" key="sep_link_online">{i18n('playOnline')}</li> : null
      }
      {hasNetwork() && session.nowPlaying().length ?
      <li className="side_link" key="current_games" config={helper.ontouchY(menu.popup(gamesMenu.open))}>
        <span className="menu_icon_game" />{i18n('nbGamesInPlay', session.nowPlaying().length)}
      </li> : null
      }
      {!hasNetwork() && offlineGames.length ?
      <li className="side_link" key="current_games" config={helper.ontouchY(menu.popup(gamesMenu.open))}>
        <span className="menu_icon_game" />{i18n('nbGamesInPlay', offlineGames.length)}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="play_real_time" config={helper.ontouchY(menu.popup(newGameForm.openRealTime))}>
        <span className="fa fa-plus-circle"/>{i18n('createAGame')}
      </li> : null
      }
      {hasNetwork() && user ?
      <li className="side_link" key="correspondence" config={helper.ontouchY(menu.route('/correspondence'))}>
        <span className="fa fa-paper-plane" />{i18n('correspondence')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="invite_friend" config={helper.ontouchY(menu.popup(challengeForm.open))}>
        <span className="fa fa-share-alt"/>{i18n('playWithAFriend')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="tv" config={helper.ontouchY(menu.route('/tv'))}>
        <span data-icon="1"/>{i18n('watchLichessTV')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="training" config={helper.ontouchY(menu.route('/training'))}>
        <span data-icon="-"/>{i18n('training')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="tournament" config={helper.ontouchY(menu.route('/tournament'))}>
        <span className="fa fa-trophy"/>{i18n('tournament')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="sep_link" key="sep_link_community">
        {i18n('community')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="players" config={helper.ontouchY(menu.route('/players'))}>
        <span className="fa fa-at"/>{i18n('players')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="ranking" config={helper.ontouchY(menu.route('/ranking'))}>
        <span className="fa fa-cubes"/>{i18n('leaderboard')}
      </li> : null
      }
      <li className="sep_link" key="sep_link_offline">
        {i18n('playOffline')}
      </li>
      <li className="side_link" key="play_ai" config={helper.ontouchY(menu.route('/ai'))}>
        <span className="fa fa-cogs"/>{i18n('playOfflineComputer')}
      </li>
      <li className="side_link" key="play_otb" config={helper.ontouchY(menu.route('/otb'))}>
        <span className="fa fa-beer"/>{i18n('playOnTheBoardOffline')}
      </li>
      <li className="sep_link" key="sep_link_tools">{i18n('tools')}</li>
      <li className="side_link" key="analyse" config={helper.ontouchY(menu.route('/analyse'))}>
        <span data-icon="A" />{i18n('analysis')}
      </li>
      <li className="side_link" key="editor" config={helper.ontouchY(menu.route('/editor'))}>
        <span className="fa fa-pencil" />{i18n('boardEditor')}
      </li>
      <li className="hr" key="sep_link_settings"></li>
      <li className="side_link" key="settings" config={helper.ontouchY(menu.route('/settings'))}>
        <span className="fa fa-cog"/>{i18n('settings')}
      </li>
    </ul>
  );
}

function renderMenu() {
  const user = session.get();

  return (
    <div className="native_scroller">
      {renderHeader(user)}
      {user && menu.headerOpen() ? renderProfileActions(user) : renderLinks(user)}
    </div>
  );
}

function slidesInUp(el, isUpdate, context) {
  if (!isUpdate) {
    el.style.transform = 'translate3d(-100%,0,0)';
    // force reflow hack
    context.lol = el.offsetHeight;
    Zanimo(el, 'transform', 'translate3d(0,0,0)', 250, 'ease-out');
  }
}
