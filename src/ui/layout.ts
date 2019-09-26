import * as Hammer from 'hammerjs'
import * as h from 'mithril/hyperscript'
import settings from '../settings'
import * as menu from './menu'
import MenuView from './menu/menuView'
import gamesMenu from './gamesMenu'
import newGameForm from './newGameForm'
import playMachineForm from './playMachineForm'
import challengeForm from './challengeForm'
import loginModal from './loginModal'
import signupModal from './signupModal'
import friendsPopup from './friendsPopup'
import lobby from './lobby'
import EdgeOpenHandler, { HammerHandlers } from './shared/sideMenu/EdgeOpenHandler'
import MainBoard from './shared/layout/MainBoard'

let background: string

export default {

  onBackgroundChange(bg: string) {
    background = bg
  },

  board(
    header: Mithril.Children,
    content: Mithril.Children,
    overlay?: Mithril.Children,
    hammerHandlers?: HammerHandlers,
    color?: string
  ) {
    background = background || settings.general.theme.background()
    return h('div.view-container', containerOpts(background), [
      h(MainBoard, { header, color, hammerHandlers }, content),
      h(MenuView),
      gamesMenu.view(),
      loginModal.view(),
      signupModal.view(),
      newGameForm.view(),
      playMachineForm.view(),
      challengeForm.view(),
      friendsPopup.view(),
      lobby.view(),
      overlay
    ])
  },

  free(
    header: Mithril.Children,
    content: Mithril.Children,
    footer?: Mithril.Children,
    overlay?: Mithril.Children
  ) {
    background = background || settings.general.theme.background()
    return h('div.view-container', containerOpts(background), [
      h('main#page', { oncreate: handleMenuOpen }, [
        h('header.main_header', header),
        h('div#free_content.content.native_scroller', content),
        footer ? h('footer.main_footer', footer) : null,
        h('div#menu-close-overlay.menu-backdrop', { oncreate: menu.backdropCloseHandler })
      ]),
      h(MenuView),
      gamesMenu.view(),
      loginModal.view(),
      signupModal.view(),
      newGameForm.view(),
      playMachineForm.view(),
      challengeForm.view(),
      friendsPopup.view(),
      lobby.view(),
      overlay
    ])
  },

  clock(content: () => Mithril.Children, overlay?: () => Mithril.Children) {
    background = background || settings.general.theme.background()
    return h('div.view-container', containerOpts(background), [
      h('main#page', [
        h('div.content.fullScreen', content())
      ]),
      overlay ? overlay() : null
    ])
  }
}

function handleMenuOpen({ dom }: Mithril.DOMNode) {
  const mainEl = dom as HTMLElement
  const mc = new Hammer.Manager(mainEl, {
    inputClass: Hammer.TouchInput
  })
  mc.add(new Hammer.Pan({
    direction: Hammer.DIRECTION_HORIZONTAL,
    threshold: 5
  }))

  const defaultHandlers: HammerHandlers = EdgeOpenHandler(menu.mainMenuCtrl)
  for (const eventName in defaultHandlers) {
    mc.on(eventName, defaultHandlers[eventName])
  }
}

function bgClass(bgTheme: string) {
  return bgTheme === 'dark' || bgTheme === 'light' ? bgTheme : 'transp ' + bgTheme
}

function containerOpts(bgTheme: string) {
  return {
    className: bgClass(bgTheme) + (window.cordova.platformId === 'ios' ? ' ios' : ''),
  }
}
