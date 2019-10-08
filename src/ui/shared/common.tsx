import * as Mithril from 'mithril'
import { Plugins } from '@capacitor/core'
import h from 'mithril/hyperscript'
import * as menu from '../menu'
import router from '../../router'
import * as utils from '../../utils'
import { hasOfflineGames } from '../../utils/offlineGames'
import settings from '../../settings'
import * as helper from '../helper'
import gamesMenu from '../gamesMenu'
import newGameForm from '../newGameForm'
import session from '../../session'
import challengesApi from '../../lichess/challenges'
import friendsApi from '../../lichess/friends'
import i18n from '../../i18n'
import friendsPopup from '../friendsPopup'
import { backArrow } from './icons'
import { BaseUser } from '../../lichess/interfaces/user'

export function menuButton() {
  return h('button.fa.fa-navicon.main_header_button.menu_button', {
    key: 'main-menu',
    oncreate: helper.ontap(menu.mainMenuCtrl.toggle)
  })
}

export function backButton(title?: Mithril.Children): Mithril.Children {
  return h('div.back_button', { key: 'default-history-backbutton' }, [
    h('button', { oncreate: helper.ontap(router.backHistory) }, backArrow),
    title !== undefined ? typeof title === 'string' ? h('div.main_header_title', title) : title : null
  ])
}

export function bookmarkButton(action: () => void, flag: boolean): Mithril.Children {
  return session.isConnected() ? h('button.main_header_button.bookmarkButton', {
    oncreate: helper.ontap(
      action,
      () => Plugins.Toast.show({ text: i18n('bookmarkThisGame'), duration: 'short' })
    ),
    key: 'bookmark',
  }, h('span', {
    'data-icon': flag ? 't' : 's'
  })) : null
}

export function friendsButton() {
  const nbFriends = friendsApi.count()
  const longAction = () => Plugins.Toast.show({ text: i18n('onlineFriends'), duration: 'short' })

  return (
    <button className="main_header_button friends_button" key="friends" data-icon="f"
      oncreate={helper.ontap(friendsPopup.open, longAction)}
    >
    {nbFriends > 0 ?
      <span className="chip nb_friends">{nbFriends}</span> : null
    }
    </button>
  )
}

let boardTheme: string
export function onBoardThemeChange(theme: string) {
  boardTheme = theme
}
function gamesButton() {
  let key: string, action: () => void
  const nbChallenges = challengesApi.all().length
  const nbIncomingChallenges = challengesApi.incoming().length
  const withOfflineGames = !utils.hasNetwork() && hasOfflineGames()
  boardTheme = boardTheme || settings.general.theme.board()
  if (session.nowPlaying().length || nbChallenges || withOfflineGames) {
    key = 'games-menu'
    action = () => gamesMenu.open()
  } else {
    key = 'new-game-form'
    action = () => newGameForm.open()
  }
  const myTurns = session.myTurnGames().length
  const className = [
    'main_header_button',
    'game_menu_button',
    boardTheme,
    nbIncomingChallenges ? 'new_challenge' : '',
    !utils.hasNetwork() && !hasOfflineGames() ? 'invisible' : ''
  ].join(' ')
  const longAction = () => Plugins.Toast.show({ text: i18n('nbGamesInPlay', session.nowPlaying().length), duration: 'short' })

  return (
    <button key={key} className={className} oncreate={helper.ontap(action, longAction)}>
      {!nbIncomingChallenges && myTurns ?
        <span className="chip nb_playing">{myTurns}</span> : null
      }
      {nbIncomingChallenges ?
        <span className="chip nb_challenges">{nbIncomingChallenges}</span> : null
      }
    </button>
  )
}

export function headerBtns() {
  if (utils.hasNetwork() && session.isConnected() && friendsApi.count()) {
    return (
      <div key="buttons" className="buttons">
        {friendsButton()}
        {gamesButton()}
      </div>
    )
  } else if (utils.hasNetwork() && session.isConnected()) {
    return (
      <div key="buttons" className="buttons">
        {gamesButton()}
      </div>
    )
  } else if (utils.hasNetwork() && session.isConnected() && friendsApi.count()) {
    return (
      <div key="buttons" className="buttons">
        {friendsButton()}
        {gamesButton()}
      </div>
    )
  }
  else {
    return (
      <div key="buttons" className="buttons">
        {gamesButton()}
      </div>
    )
  }
}

// TODO refactor this
export function header(title: Mithril.Vnode<any, any> | string | null, leftButton?: Mithril.Children): Mithril.Children {
  return h('nav', [
    leftButton ? leftButton : menuButton(),
    typeof title === 'string' ?
      h('div.main_header_title', {
        key: title
      }, title) : title,
    headerBtns()
  ])
}

export function dropShadowHeader(title: Mithril.Children, leftButton?: Mithril.Children): Mithril.Children {
  return [
    h('nav', [
      leftButton ? leftButton : menuButton(),
      title ? <div className="main_header_title" key="title">{title}</div> : null,
      headerBtns()
    ]),
  ]
}

export const loader = (
  <div className="loader_circles">
    {[1, 2, 3].map(i => <div className={'circle_' + i} />)}
  </div>
)

export function connectingHeader(title?: string) {
  return (
    <nav>
      {menuButton()}
      <div key="connecting-title" className={'main_header_title reconnecting' + (title ? 'withTitle' : '')}>
        {title ? <span>{title}</span> : null}
        {loader}
      </div>
      {headerBtns()}
    </nav>
  )
}

export function connectingDropShadowHeader(title?: string) {
  return [
    h('nav', [
      menuButton(),
      h('div.main_header_title.reconnecting', {
        className: title ? 'withTitle' : '',
        key: 'connecting-title',
      }),
      title ? h('div.main_header_title', { key: 'title' }, title) : null,
      headerBtns()
    ]),
  ]
}


export function loadingBackbutton(title?: string) {
  return (
    <nav>
      {backButton(
        <div key="connecting-backbutton" className={'main_header_title reconnecting' + (title ? 'withTitle' : '')}>
          {title ? <span>{title}</span> : null}
          {loader}
        </div>
      )}
      {headerBtns()}
    </nav>
  )
}

export function empty(): Mithril.Children {
  return []
}

export function userStatus(user: BaseUser) {
  const status = user.online ? 'online' : 'offline'
  return (
    <div className="user">
      {user.patron ?
        <span className={'patron userStatus ' + status} data-icon="" /> :
        <span className={'fa fa-circle userStatus ' + status} />
      }
      {user.title ? <span className="userTitle">{user.title}&nbsp;</span> : null}
      {user.username}
    </div>
  )
}
