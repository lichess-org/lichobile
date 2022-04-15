import { Capacitor } from '@capacitor/core'
import h from 'mithril/hyperscript'
import settings from '../settings'
import Gesture from '../utils/Gesture'
import { getSystemTheme } from '../theme'
import { viewportDim } from './helper'
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
import EdgeOpenHandler, { Handlers } from './shared/sideMenu/EdgeOpenHandler'
import MainBoard from './shared/layout/MainBoard'
import renderAnnouncement from './announceView'
import announce from '~/announce'

export default {

  board(
    header: Mithril.Children,
    content: Mithril.Children,
    key?: string,
    overlay?: Mithril.Children,
    handlers?: Handlers,
    color?: string,
    klass?: string,
  ) {
    const background = settings.general.theme.background()
    const opts = key ? {
      key,
      ...containerOpts(background)
    } : containerOpts(background)
    return h('div.view-container', opts, [
      h(MainBoard, { header, color, handlers, klass }, content),
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
    overlay?: Mithril.Children,
    scrollListener?: (e: Event) => void
  ): Mithril.Vnode {
    const background = settings.general.theme.background()
    return h('div.view-container', containerOpts(background), [
      h('main#page', { oncreate: handleMenuOpen }, [
        h('header.main_header', header),
        renderAnnouncement(announce.get()),
        h('div#free_content.content.native_scroller', {
          className: footer ? 'withFooter' : '',
          oncreate: ({ dom }) => {
            if (scrollListener) {
              dom.addEventListener('scroll', scrollListener)
            }
          }
        }, content),
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
    const background = settings.general.theme.background()
    return h('div.view-container', containerOpts(background), [
      h('main#page', [
        h('div.content.fullScreen', content())
      ]),
      overlay ? overlay() : null
    ])
  }
}

function handleMenuOpen({ dom }: Mithril.VnodeDOM<any, any>) {
  const mainEl = dom as HTMLElement
  const gesture = new Gesture(mainEl, viewportDim(), {
    passiveMove: Capacitor.platform !== 'ios'
  })

  const defaultHandlers: Handlers = EdgeOpenHandler(menu.mainMenuCtrl)
  for (const eventName in defaultHandlers) {
    gesture.on(eventName, defaultHandlers[eventName](gesture))
  }
}

function bgClass(key: string) {
  return key === 'dark' || key === 'light' ? key :
    key === 'system' ? getSystemTheme() :
    'transp ' + key
}

function containerOpts(bgTheme: string) {
  return {
    className: bgClass(bgTheme)
  }
}
