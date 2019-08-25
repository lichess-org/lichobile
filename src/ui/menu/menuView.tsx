import * as h from 'mithril/hyperscript'

import router from '../../router'
import * as utils from '../../utils'
import socket from '../../socket'
import session, { Session } from '../../session'
import i18n from '../../i18n'
import { hasNetwork, noop } from '../../utils'
import { getOfflineGames } from '../../utils/offlineGames'
import friendsApi from '../../lichess/friends'

import loginModal from '../loginModal'
import newGameForm from '../newGameForm'
import gamesMenu from '../gamesMenu'
import friendsPopup from '../friendsPopup'
import * as helper from '../helper'
import CloseSlideHandler from '../shared/sideMenu/CloseSlideHandler'
import CloseSwipeHandler from '../shared/sideMenu/CloseSwipeHandler'

import * as menu from '.'

const pingHelp = 'PING: Network lag between you and lichess; SERVER: Time to process a move on lichess server'

export default {
  onbeforeupdate() {
    return menu.mainMenuCtrl.isOpen
  },
  view() {
    const user = session.get()

    return (
      <aside id="side_menu"
        oncreate={({ dom }: Mithril.DOMNode) => {
          if (window.cordova.platformId === 'ios') {
            CloseSwipeHandler(dom as HTMLElement, menu.mainMenuCtrl)
          } else {
            CloseSlideHandler(dom as HTMLElement, menu.mainMenuCtrl)
          }
        }}
      >
        {renderHeader(user)}
        <div className="native_scroller side_menu_scroller">
          {user && menu.profileMenuOpen() ? renderProfileActions(user) : renderLinks(user)}
        </div>
      </aside>
    )
  }
} as Mithril.Component<{}, {}>

function renderHeader(user?: Session) {
  const profileLink = user ? menu.route('/@/' + user.id) : noop

  return (
    <header className="side_menu_header">
      { session.isKidMode() ? <div className="kiddo">😊</div> : null }
      { hasNetwork() && !user ?
        <button className="signInButton" oncreate={helper.ontapXY(loginModal.open)}>
          {i18n('signIn')}
        </button> : null
      }
      { user ?
        <h2 className="username" oncreate={helper.ontapXY(profileLink)}>
          { user.patron ?
            <div className="patron" data-icon="" /> : null
          }
          {user.username}
        </h2> : null
      }
      { networkStatus(user) }
      { hasNetwork() && user ? profileActionsToggle() : null }
    </header>
  )
}

function renderProfileActions(user: Session) {
  return (
    <ul className="side_links profileActions">
      <li className="side_link" oncreate={helper.ontapXY(menu.route('/@/' + user.id))}>
        <span className="fa fa-user" />{i18n('profile')}
      </li>
      <li className="side_link" oncreate={helper.ontapXY(() => {
        menu.mainMenuCtrl.close().then(() => {
          const params: StringMap = {
            username: user.username,
            title: user.title,
          }
          if (user.patron) params.patron = '1'
          router.set(`/@/${user.id}/games?${utils.serializeQueryParameters(params)}`)
        })
      })}>
        <span className="menu_icon_game" />{i18n('games')}
      </li>
      <li className="side_link" oncreate={helper.ontapXY(menu.route('/inbox'))}>
        <span className="fa fa-envelope"/>{i18n('inbox') + ((menu.inboxUnreadCount() !== null && menu.inboxUnreadCount() > 0) ? (' (' + menu.inboxUnreadCount() + ')') : '')}
      </li>
      <li className="side_link" oncreate={helper.ontapXY(menu.route('/account/preferences'))}>
        <span data-icon="%" />
        {i18n('preferences')}
      </li>
      <li className="side_link" oncreate={helper.ontapXY(menu.popup(friendsPopup.open))}>
        <span data-icon="f" />
        {i18n('onlineFriends') + ` (${friendsApi.count()})`}
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
}

function onLinkTap(e: Event) {
  const el = helper.getLI(e)
  const ds = el.dataset
  if (el && ds.route) {
    menu.route(ds.route)()
  } else if (el && ds.popup) {
    menu.popup(popupActionMap[ds.popup])()
  }
}

function renderLinks(user?: Session) {
  const offlineGames = getOfflineGames()
  const online = hasNetwork()

  return (
    <ul
      key={online ? 'online-links' : 'offline-links'}
      className="side_links"
      oncreate={helper.ontapXY(onLinkTap, undefined, helper.getLI)}
    >
      <li className="side_link" data-route="/">
        <span className="fa fa-home" />Home
      </li>
      {online ?
      <li className="sep_link">{i18n('playOnline')}</li> : null
      }
      {!online && offlineGames.length ?
      <li className="side_link" data-popup="gamesMenu">
        <span className="menu_icon_game" />{i18n('nbGamesInPlay', offlineGames.length)}
      </li> : null
      }
      {online && !session.hasCurrentBan() ?
      <li className="side_link" data-popup="createGame">
        <span className="fa fa-plus-circle"/>{i18n('createAGame')}
      </li> : null
      }
      {online ?
      <li className="side_link" data-route="/tournament">
        <span className="fa fa-trophy"/>{i18n('tournament')}
      </li> : null
      }
      <li className="sep_link">{i18n('learn')}</li>
      {online ?
        <li className="side_link" data-route="/training">
          <span data-icon="-"/>{i18n('training')}
        </li> : null
      }
      {!online && user ?
        <li className="side_link" data-route="/training">
          <span data-icon="-" />{i18n('training')}
        </li> : null
      }
      {online ?
        <li className="side_link" data-route="/study">
          <span data-icon="4" />Study
        </li> : null
      }
      {online ?
      <li className="sep_link">
        {i18n('watch')}
      </li> : null
      }
      {online ?
      <li className="side_link" data-route="/tv">
        <span data-icon="1"/>{i18n('watchLichessTV')}
      </li> : null
      }
      {online ?
      <li className="sep_link">
        {i18n('community')}
      </li> : null
      }
      {online ?
      <li className="side_link" data-route="/players">
        <span className="fa fa-at"/>{i18n('players')}
      </li> : null
      }
      <li className="sep_link">{i18n('tools')}</li>
      <li className="side_link" data-route="/analyse">
        <span data-icon="A" />{i18n('analysis')}
      </li>
      <li className="side_link" data-route="/editor">
        <span className="fa fa-pencil" />{i18n('boardEditor')}
      </li>
      <li className="side_link" data-route="/clock">
        <span className="fa fa-clock-o"/>{i18n('clock')}
      </li>
      {online ?
      <li className="side_link" data-route="/importer">
        <span className="fa fa-cloud-upload" />{i18n('importGame')}
      </li> : null
      }
      {online ?
      <li className="side_link" data-route="/search">
        <span className="fa fa-search" />{i18n('advancedSearch')}
      </li> : null
      }
      <li className="sep_link">
        {i18n('playOffline')}
      </li>
      <li className="side_link" data-route="/ai">
        <span className="fa fa-cogs"/>{i18n('playOfflineComputer')}
      </li>
      <li className="side_link" data-route="/otb">
        <span className="fa fa-beer"/>{i18n('playOnTheBoardOffline')}
      </li>
      <li className="hr"></li>
      <li className="side_link" data-route="/settings">
        <span className="fa fa-cog"/>{i18n('settings')}
      </li>
      <li className="side_link" data-route="/about">
        <span className="fa fa-info-circle" />About
      </li>
    </ul>
  )
}

function profileActionsToggle() {

  return (
    <div className="menu-toggleButton side_link"
      oncreate={helper.ontapXY(menu.toggleHeader)}
    >
      <span className="fa fa-exchange" />
      {menu.profileMenuOpen() ? 'Main menu' : 'User menu'}
    </div>
  )
}

function networkStatus(user?: Session) {
  const ping = menu.ping()
  const server = menu.mlat()
  return (
    <div className="pingServer"
      oncreate={helper.ontapXY(() => window.plugins.toast.show(pingHelp, 'long', 'top'))}
    >
      { signalBars(hasNetwork() ? ping : undefined)}
      { hasNetwork() ? (
          <div>
            <div>
              <span className="pingKey">Ping&nbsp;&nbsp;&nbsp;</span>
              <strong className="pingValue">{socket.isConnected() && ping ? ping : '?'}</strong> ms
            </div>
            { user ?
              <div>
                <span className="pingKey">Server&nbsp;</span>
                <strong className="pingValue">{socket.isConnected() && server ? server : '?'}</strong> ms
              </div> : null
            }
          </div>
        ) : (
          <div>
            Offline
          </div>
        )
      }
    </div>
  )
}

function signalBars(ping?: number) {
  const lagRating =
    ping === undefined ? 0 :
    (ping < 150) ? 4 :
    (ping < 300) ? 3 :
    (ping < 500) ? 2 : 1
  const bars = []
  for (let i = 1; i <= 4; i++) bars.push(h(i <= lagRating ? 'i' : 'i.off'))
  return h('signal.q' + lagRating, bars)
}
