import { Plugins } from '@capacitor/core'
import h from 'mithril/hyperscript'
import * as menu from '../menu'
import router from '../../router'
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
    oncreate: helper.ontap(menu.mainMenuCtrl.toggle)
  })
}

export function backButton(title?: Mithril.Children): Mithril.Children {
  return h('div.back_button', [
    h('button', { oncreate: helper.ontap(router.backHistory) }, backArrow),
    title !== undefined ? typeof title === 'string' ? h('div.main_header_title', title) : title : null
  ])
}

export function bookmarkButton(action: () => void, flag: boolean): Mithril.Children {
  return session.isConnected() ? h('button.main_header_button.bookmarkButton', {
    oncreate: helper.ontap(
      action,
      () => Plugins.LiToast.show({ text: i18n('bookmarkThisGame'), duration: 'short', position: 'top' })
    ),
  }, h('span', {
    'data-icon': flag ? 't' : 's'
  })) : null
}

export function friendsButton() {
  const nbFriends = friendsApi.count()

  return (
    <button className="main_header_button friends_button" data-icon="f"
      data-button="friends"
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
  boardTheme = boardTheme || settings.general.theme.board()
  const myTurns = session.myTurnGames().length
  const nbIncomingChallenges = challengesApi.incoming().length
  const className = [
    'main_header_button',
    'game_menu_button',
    boardTheme,
    nbIncomingChallenges ? 'new_challenge' : '',
  ].join(' ')

  return (
    <button className={className} data-button="games">
      {!nbIncomingChallenges && myTurns ?
        <span className="chip nb_playing">{myTurns}</span> : null
      }
      {nbIncomingChallenges ?
        <span className="chip nb_challenges">{nbIncomingChallenges}</span> : null
      }
    </button>
  )
}

function onHeaderBtnTap(e: Event) {
  const el = helper.closest(e, '.main_header_button')
  const button = el?.dataset.button
  if (el && button) {
    if (button === 'games') {
      const nbChallenges = challengesApi.all().length
      if (session.nowPlaying().length || nbChallenges) {
        gamesMenu.open()
      } else {
        newGameForm.open()
      }
    } else if (button === 'friends') {
      friendsPopup.open()
    }
  }
}

export function headerBtns() {
  const handler = helper.ontap(
    onHeaderBtnTap,
    undefined,
    undefined,
    helper.closestHandler('.main_header_button')
  )
  if (session.isConnected() && friendsApi.count()) {
    return (
      <div className="buttons" oncreate={handler}>
        {friendsButton()}
        {gamesButton()}
      </div>
    )
  }
  else {
    return (
      <div className="buttons" oncreate={handler}>
        {gamesButton()}
      </div>
    )
  }
}

// TODO refactor this
export function header(title: Mithril.Child | string | null, leftButton?: Mithril.Children): Mithril.Children {
  return h('nav', [
    leftButton ? leftButton : menuButton(),
    typeof title === 'string' ?
      h('div.main_header_title', title) : title,
    headerBtns()
  ])
}

export function dropShadowHeader(title: Mithril.Children, leftButton?: Mithril.Children): Mithril.Children {
  return [
    h('nav', [
      leftButton ? leftButton : menuButton(),
      title ? <div className="main_header_title">{title}</div> : null,
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
      <div className={'main_header_title reconnecting' + (title ? 'withTitle' : '')}>
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
      }),
      title ? h('div.main_header_title', title) : null,
      headerBtns()
    ]),
  ]
}


export function loadingBackbutton(title?: string) {
  return h('nav', [
    backButton(h('div.main_header_title.reconnecting', {
      className: title ? 'withTitle' : '',
    }, [
      title ? h('span', title) : null,
      loader,
    ])),
    headerBtns()
  ])
}

export function empty(): Mithril.Children {
  return []
}

export function userStatus(user: BaseUser): Mithril.Vnode {
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
