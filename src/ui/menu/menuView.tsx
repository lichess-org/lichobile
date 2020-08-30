import * as Mithril from 'mithril'
import { Plugins } from '@capacitor/core'
import h from 'mithril/hyperscript'
import * as utils from '../../utils'
import socket from '../../socket'
import redraw from '../../utils/redraw'
import session, { Session } from '../../session'
import i18n, { plural } from '../../i18n'
import { hasNetwork } from '../../utils'
import friendsApi from '../../lichess/friends'

import loginModal from '../loginModal'
import newGameForm from '../newGameForm'
import gamesMenu from '../gamesMenu'
import friendsPopup from '../friendsPopup'
import * as helper from '../helper'
import CloseSlideHandler from '../shared/sideMenu/CloseSlideHandler'

import * as menu from '.'

const pingHelp = `PING: ${i18n('networkLagBetweenYouAndLichess')}; SERVER: ${i18n('timeToProcessAMoveOnLichessServer')}`

export default {
  onbeforeupdate() {
    return menu.mainMenuCtrl.isOpen
  },
  view() {
    const user = session.get()

    return (
      <aside id="side_menu"
        oncreate={({ dom }: Mithril.VnodeDOM<any, any>) => {
          CloseSlideHandler(dom as HTMLElement, menu.mainMenuCtrl)
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
  const caretClass = menu.profileMenuOpen() ? 'up' : 'down'
  return (
    <header className="side_menu_header"
      oncreate={helper.ontapXY(menu.toggleHeader)}
    >
      { session.isKidMode() ? <div className="kiddo">😊</div> : null }
      { networkStatus(user) }
      { hasNetwork() && !user ?
        <button className="signInButton" oncreate={helper.ontapXY(loginModal.open)}>
          {i18n('signIn')}
        </button> : null
      }
      { user ?
        <h2 className="username">
          {user.username}
          <i className={'fa fa-caret-' + caretClass} />
        </h2> : null
      }
    </header>
  )
}

function renderProfileActions(user: Session) {
  const gamesRouteParams: StringMap = {
    username: user.username,
    title: user.title,
  }
  if (user.patron) gamesRouteParams.patron = '1'
  return (
    <ul className="side_links profileActions"
      oncreate={helper.ontapXY(onLinkTap, undefined, helper.getLI)}
    >
      <li className="side_link" data-route={`/@/${user.id}`}>
        { user.patron ?
          <span className="patron" data-icon="" /> :
          <span className="fa fa-circle userStatus online" />
        }
        {i18n('profile')}
      </li>
      <li className="side_link" data-route={`/@/${user.id}/games?${utils.serializeQueryParameters(gamesRouteParams)}`}
      >
        <span className="menu_icon_game" />{i18n('games')}
      </li>
      <li className="side_link" data-route="/inbox">
        <span className="fa fa-envelope"/>{i18n('inbox') + ((menu.inboxUnreadCount() !== null && menu.inboxUnreadCount() > 0) ? (' (' + menu.inboxUnreadCount() + ')') : '')}
      </li>
      <li className="side_link" data-route="/account/preferences">
        <span data-icon="%" />
        {i18n('preferences')}
      </li>
      <li className="side_link" data-action="friends">
        <span data-icon="f" />
        {plural('nbFriendsOnline', friendsApi.count())}
      </li>
      <li className="side_link" data-route={`/@/${user.id}/related`}>
        <span className="fa fa-arrow-circle-left" />
        {plural('nbFollowers', user.nbFollowers || 0)}
      </li>
      <li className="side_link" data-nocloseaction="logout">
        <span data-icon="w" />
        {i18n('logOut')}
      </li>
    </ul>
  )
}

const actionMap: { [index: string]: () => void } = {
  gamesMenu: () => gamesMenu.open(),
  createGame: () => newGameForm.openRealTime(),
  friends: () => friendsPopup.open(),
  logout: () => {
    session.logout()
    menu.profileMenuOpen(false)
  },
}

function onLinkTap(e: Event) {
  e.stopPropagation()
  const el = helper.getLI(e)
  const ds = el.dataset
  if (el && ds.route) {
    menu.route(ds.route)()
  } else if (el && ds.action) {
    menu.action(actionMap[ds.action])()
  } else if (el && ds.nocloseaction) {
    actionMap[ds.nocloseaction]()
    redraw()
  }
}

function renderLinks(user?: Session) {
  const online = hasNetwork()

  return (
    <ul
      className="side_links"
      oncreate={helper.ontapXY(onLinkTap, undefined, helper.getLI)}
    >
      <li className="side_link" data-route="/">
        <span className="fa fa-home" />Home
      </li>
      {online ?
      <li className="sep_link">{i18n('playOnline')}</li> : null
      }
      {online && !session.hasCurrentBan() ?
      <li className="side_link" data-action="createGame">
        <span className="fa fa-plus-circle"/>{i18n('createAGame')}
      </li> : null
      }
      {online ?
      <li className="side_link" data-route="/tournament">
        <span className="fa fa-trophy"/>{i18n('tournaments')}
      </li> : null
      }
      <li className="sep_link">{i18n('learnMenu')}</li>
      {online ?
        <li className="side_link" data-route="/training">
          <span data-icon="-"/>{i18n('puzzles')}
        </li> : null
      }
      {!online && user ?
        <li className="side_link" data-route="/training">
          <span data-icon="-" />{i18n('puzzles')}
        </li> : null
      }
      {online ?
        <li className="side_link" data-route="/study">
          <span data-icon="4" />{i18n('studyMenu')}
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
        <span className="fa fa-info-circle" />{i18n('about')}
      </li>
    </ul>
  )
}

function networkStatus(user?: Session) {
  const ping = menu.ping()
  const server = menu.mlat()
  const showToast = (e: Event) => {
    e.stopPropagation()
    Plugins.LiToast.show({ text: pingHelp, duration: 'long', position: 'top' })
  }
  return (
    <div className="pingServer">
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
      { hasNetwork() ?
        <i className="fa fa-question-circle-o"
          oncreate={helper.ontapXY(showToast)}
        /> : null
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
