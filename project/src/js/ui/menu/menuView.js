import session from '../../session';
import loginModal from '../loginModal';
import newGameForm from '../newGameForm';
import gamesMenu from '../gamesMenu';
import friendsPopup from '../friendsPopup';
import challengeForm from '../challengeForm';
import i18n from '../../i18n';
import * as utils from '../../utils';
import helper from '../helper';
import menu from './menu';
import friendsApi from '../../lichess/friends';
import m from 'mithril';

function renderHeader(user) {
  if (utils.hasNetwork())
    return user ? [
      m('div.logo'),
      m('h2.username', user.username),
      m('button.open_button', {
        'data-icon': menu.headerOpen() ? 'S' : 'R',
        config: helper.ontouch(menu.toggleHeader, null, false)
      })
    ] : [
      m('div.logo'),
      m('h2.username', 'Anonymous'),
      m('button.login', {
        config: helper.ontouchY(loginModal.open)
      }, i18n('signIn'))
    ];
  else
    return [
      m('div.logo'),
      m('h2.username', 'Offline')
    ];
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
  return (
    <ul className="side_links">
      {utils.hasNetwork() ?
      <li className="sep_link" key="sep_link_online">{i18n('playOnline')}</li> : null
      }
      {utils.hasNetwork() && session.nowPlaying().length ?
      <li className="side_link" key="current_games" config={helper.ontouchY(menu.popup(gamesMenu.open))}>
        <span className="menu_icon_game" />{i18n('nbGamesInPlay', session.nowPlaying().length)}
      </li> : null
      }
      {utils.hasNetwork() ?
      <li className="side_link" key="play_real_time" config={helper.ontouchY(menu.popup(newGameForm.openRealTime))}>
        <span className="fa fa-plus-circle"/>{i18n('createAGame')}
      </li> : null
      }
      {utils.hasNetwork() && user ?
      <li className="side_link" key="correspondence" config={helper.ontouchY(menu.route('/correspondence'))}>
        <span className="fa fa-paper-plane" />{i18n('correspondence')}
      </li> : null
      }
      {utils.hasNetwork() ?
      <li className="side_link" key="invite_friend" config={helper.ontouchY(menu.popup(challengeForm.open))}>
        <span className="fa fa-share-alt"/>{i18n('playWithAFriend')}
      </li> : null
      }
      {utils.hasNetwork() ?
      <li className="side_link" key="tv" config={helper.ontouchY(menu.route('/tv'))}>
        <span data-icon="1"/>{i18n('watchLichessTV')}
      </li> : null
      }
      {utils.hasNetwork() ?
      <li className="side_link" key="training" config={helper.ontouchY(menu.route('/training'))}>
        <span data-icon="-"/>{i18n('training')}
      </li> : null
      }
      {utils.hasNetwork() ?
      <li className="sep_link" key="sep_link_community">
        {i18n('community')}
      </li> : null
      }
      {utils.hasNetwork() ?
      <li className="side_link" key="players" config={helper.ontouchY(menu.route('/players'))}>
        <span className="fa fa-at"/>{i18n('players')}
      </li> : null
      }
      {utils.hasNetwork() ?
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

export default function view() {
  const user = session.get();

  return (
    <aside id="side_menu" className={menu.isOpen ? 'in' : 'out'}>
      <div className="native_scroller">
        <header className="side_menu_header">
          {renderHeader(user)}
        </header>
        {user && menu.headerOpen() ? renderProfileActions(user) : renderLinks(user)}
      </div>
    </aside>
  );
}
