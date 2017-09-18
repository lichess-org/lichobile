import * as h from 'mithril/hyperscript'

import socket from '../../socket'
import session, { Session } from '../../session'
import loginModal from '../loginModal'
import newGameForm from '../newGameForm'
import gamesMenu from '../gamesMenu'
import friendsPopup from '../friendsPopup'
import challengeForm from '../challengeForm'
import playMachineForm from '../playMachineForm'
import i18n from '../../i18n'
import { hasNetwork } from '../../utils'
import { getOfflineGames } from '../../utils/offlineGames'
import * as helper from '../helper'
import friendsApi from '../../lichess/friends'

import * as menu from '.'
import CloseSlideHandler from './CloseSlideHandler'
import CloseSwipeHandler from './CloseSwipeHandler'

interface PingData {
  ping: number | undefined
  server: number | undefined
}

const pingHelp = 'PING: Network lag between you and lichess; SERVER: Time to process a move on lichess server'

export default {
  onbeforeupdate() {
    return menu.isOpen() || menu.isSliding()
  },
  view() {
    const user = session.get()

    return (
      <aside id="side_menu"
        oncreate={({ dom }: Mithril.DOMNode) => {
          if (window.cordova.platformId === 'ios') {
            CloseSwipeHandler(dom as HTMLElement)
          } else {
            CloseSlideHandler(dom as HTMLElement)
          }
        }}
      >
        <div className="native_scroller">
          {renderHeader(user)}
          { hasNetwork() && user ? profileActionsToggle() : null }
          {user && menu.profileMenuOpen() ? renderProfileActions(user) : renderLinks(user)}
        </div>
      </aside>
    )
  }
} as Mithril.Component<{}, {}>

function renderHeader(user?: Session) {
  return (
    <header className="side_menu_header">
      { session.isKidMode() ? <div key="kiddo" className="kiddo">😊</div> : null }
      { !hasNetwork() ?
        <h2 key="username-offline" className="username">
          {i18n('offline')}
        </h2> : null
      }
      { hasNetwork() && !user ?
        <h2 key="username-anon" className="username">
          Anonymous
        </h2> : null
      }
      { hasNetwork() && user ?
        <h2 key="username-connected" className="username connected">
          { user.patron ?
            <div className="patron" data-icon="" /> : null
          }
          { user.username }
        </h2> : null
      }
      { hasNetwork() && session.isConnected() ? networkStatus() : null }
      { hasNetwork() && !user ?
        <button key="login-button" className="login" oncreate={helper.ontapXY(loginModal.open)}>
          {i18n('signIn')}
        </button> : null
      }
    </header>
  )
}

function renderProfileActions(user: Session) {
  return (
    <ul className="side_links profileActions">
      <li className="side_link" key="profile" oncreate={helper.ontapXY(menu.route('/@/' + user.id))}>
        <span className="fa fa-user" />{i18n('profile')}
      </li>
      <li className="side_link" key="message" oncreate={helper.ontapXY(menu.route('/inbox'))}>
        <span className="fa fa-envelope"/>{i18n('inbox') + ((menu.inboxUnreadCount() !== null && menu.inboxUnreadCount() > 0) ? (' (' + menu.inboxUnreadCount() + ')') : '')}
      </li>
      <li className="side_link" oncreate={helper.ontapXY(menu.popup(friendsPopup.open))}>
        <span data-icon="f" />
        {i18n('onlineFriends') + ` (${friendsApi.count()})`}
      </li>
      <li className="side_link" oncreate={helper.ontapXY(menu.route(`/@/${user.id}/following`))}>
        <span className="fa fa-arrow-circle-right" />
        {i18n('nbFollowing', user.nbFollowing || 0)}
      </li>
      <li className="side_link" oncreate={helper.ontapXY(menu.route(`/@/${user.id}/followers`))}>
        <span className="fa fa-arrow-circle-left" />
        {i18n('nbFollowers', user.nbFollowers || 0)}
      </li>
      <li className="side_link" oncreate={helper.ontapXY(menu.route('/settings/preferences'))}>
        <span data-icon="%" />
        {i18n('preferences')}
      </li>
      <li className="side_link" oncreate={helper.ontapXY(() => {
        session.logout()
        menu.profileMenuOpen(false)
      })}>
        <span data-icon="w" />
        {i18n('logOut')}
      </li>
    </ul>
  )
}

const popupActionMap: { [index: string]: () => void } = {
  gamesMenu: () => gamesMenu.open(),
  createGame: () => newGameForm.openRealTime(),
  challenge: () => challengeForm.open(),
  machine: () => playMachineForm.open()
}

interface MenuLinkDataset extends DOMStringMap {
  route?: string
  popup?: string
}
function onLinkTap(e: Event) {
  const el = helper.getLI(e)
  const ds = el.dataset as MenuLinkDataset
  if (el && ds.route) {
    menu.route(ds.route)()
  } else if (el && ds.popup) {
    menu.popup(popupActionMap[ds.popup])()
  }
}

function renderLinks(user?: Session) {
  const offlineGames = getOfflineGames()

  return (
    <ul className="side_links" oncreate={helper.ontapXY(onLinkTap, undefined, helper.getLI)}>
      <li className="side_link" key="home" data-route="/">
        <span className="fa fa-home" />Home
      </li>
      {hasNetwork() ?
      <li className="sep_link" key="sep_link_online">{i18n('playOnline')}</li> : null
      }
      {hasNetwork() && session.nowPlaying().length ?
      <li className="side_link" key="current_games" data-popup="gamesMenu">
        <span className="menu_icon_game" />{i18n('nbGamesInPlay', session.nowPlaying().length)}
      </li> : null
      }
      {!hasNetwork() && offlineGames.length ?
      <li className="side_link" key="current_games" data-popup="gamesMenu">
        <span className="menu_icon_game" />{i18n('nbGamesInPlay', offlineGames.length)}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="play_real_time" data-popup="createGame">
        <span className="fa fa-plus-circle"/>{i18n('createAGame')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="invite_friend" data-popup="challenge">
        <span className="fa fa-share-alt"/>{i18n('playWithAFriend')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="play_online_ai" data-popup="machine">
        <span className="fa fa-cogs"/>{i18n('playWithTheMachine')}
      </li> : null
      }
      {hasNetwork() && user ?
      <li className="side_link" key="correspondence" data-route="/correspondence">
        <span className="fa fa-paper-plane" />{i18n('correspondence')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="tournament" data-route="/tournament">
        <span className="fa fa-trophy"/>{i18n('tournament')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="training" data-route="/training">
        <span data-icon="-"/>{i18n('training')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="sep_link" key="sep_link_community">
        {i18n('community')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="tv" data-route="/tv">
        <span data-icon="1"/>{i18n('watchLichessTV')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="players" data-route="/players">
        <span className="fa fa-at"/>{i18n('players')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="ranking" data-route="/ranking">
        <span className="fa fa-cubes"/>{i18n('leaderboard')}
      </li> : null
      }
      <li className="sep_link" key="sep_link_offline">
        {i18n('playOffline')}
      </li>
      <li className="side_link" key="play_ai" data-route="/ai">
        <span className="fa fa-cogs"/>{i18n('playOfflineComputer')}
      </li>
      <li className="side_link" key="play_otb" data-route="/otb">
        <span className="fa fa-beer"/>{i18n('playOnTheBoardOffline')}
      </li>
      <li className="side_link" key="standalone_clock" data-route="/clock">
        <span className="fa fa-clock-o"/>{i18n('clock')}
      </li>
      <li className="sep_link" key="sep_link_tools">{i18n('tools')}</li>
      <li className="side_link" key="analyse" data-route="/analyse">
        <span data-icon="A" />{i18n('analysis')}
      </li>
      <li className="side_link" key="editor" data-route="/editor">
        <span className="fa fa-pencil" />{i18n('boardEditor')}
      </li>
      {hasNetwork() ?
      <li className="side_link" key="importer" data-route="/importer">
        <span className="fa fa-cloud-upload" />{i18n('importGame')}
      </li> : null
      }
      {hasNetwork() ?
      <li className="side_link" key="search" data-route="/search">
        <span className="fa fa-search" />{i18n('advancedSearch')}
      </li> : null
      }
      <li className="hr" key="sep_link_settings"></li>
      <li className="side_link" key="settings" data-route="/settings">
        <span className="fa fa-cog"/>{i18n('settings')}
      </li>
    </ul>
  )
}

function profileActionsToggle() {

  return (
    <div key="user-button" className="menu-toggleButton side_link"
      oncreate={helper.ontapXY(menu.toggleHeader)}
    >
      <span className="fa fa-exchange" />
      {menu.profileMenuOpen() ? 'Main menu' : 'User menu'}
    </div>
  )
}

function networkStatus() {
  const ping = menu.ping()
  const server = menu.mlat()
  return (
    <div key="server-lag" className="pingServerLed"
      oncreate={helper.ontapXY(() => window.plugins.toast.show(pingHelp, 'long', 'top'))}
    >
      <div className="pingServer">
        {signalBars({ ping, server })}
        <div>
          <span className="pingKey">Ping&nbsp;&nbsp;&nbsp;</span>
          <strong className="pingValue">{socket.isConnected() && ping ? ping : '?'}</strong> ms
        </div>
        <div>
          <span className="pingKey">Server&nbsp;</span>
          <strong className="pingValue">{socket.isConnected() && server ? server : '?'}</strong> ms
        </div>
      </div>
    </div>
  )
}

function signalBars(d: PingData) {
  const lagRating =
    !d.ping ? 0 :
    (d.ping < 150) ? 4 :
    (d.ping < 300) ? 3 :
    (d.ping < 500) ? 2 : 1
  const bars = []
  for (let i = 1; i <= 4; i++) bars.push(h(i <= lagRating ? 'i' : 'i.off'))
  return h('signal.q' + lagRating, bars)
}
