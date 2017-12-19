import * as stream from 'mithril/stream'
import * as Zanimo from 'zanimo'
import { hasNetwork } from '../../utils'
import globalRedraw from '../../utils/redraw'
import router from '../../router'
import socket from '../../socket'
import session from '../../session'
import * as inboxXhr from '../inbox/inboxXhr'
import { viewportDim } from '../helper'
import ButtonHandler from '../helper/button'
import newGameForm from '../newGameForm'
import gamesMenu from '../gamesMenu'
import friendsPopup from '../friendsPopup'
import challengeForm from '../challengeForm'
import playMachineForm from '../playMachineForm'

import redrawMenu from './redraw'
import OpenSlideHandler from './OpenSlideHandler'
import CloseSlideHandler from './CloseSlideHandler'
import CloseSwipeHandler from './CloseSwipeHandler'

export const OPEN_AFTER_SLIDE_RATIO = 0.6

let pingsTimeoutID: number

export const inboxUnreadCount = stream(0)
export const profileMenuOpen = stream(false)
export const isOpen = stream(false)
export const mlat = stream(0)
export const ping = stream(0)

// used to redraw before opening
export const isSliding = stream(false)

export function init() {
  const edgeArea = document.getElementById('edge_menu_area')
  const backdrop = document.getElementById('menu-close-overlay')
  const menu = document.getElementById('side_menu')
  if (edgeArea) {
    OpenSlideHandler(edgeArea)
  }
  if (backdrop) {
    ButtonHandler(backdrop, () => close())
  }
  if (menu) {
    if (window.cordova.platformId === 'ios') {
      CloseSwipeHandler(menu)
    } else {
      CloseSlideHandler(menu)
    }
    redrawMenu()
  }
}

export function toggle() {
  if (isOpen()) close()
  else open()
}

export function open() {
  redrawMenu()
  isOpen(true)
  router.backbutton.stack.push(close)
  if (hasNetwork()) {
    socket.send('moveLat', true)
  }
  pingsTimeoutID = setTimeout(getServerLags, 1000)
  const el = document.getElementById('side_menu')
  const bd = document.getElementById('menu-close-overlay')
  return Promise.all([
    Zanimo(bd, 'visibility', 'visible', 0),
    Zanimo(bd, 'opacity', 0.5, 250, 'linear'),
    Zanimo(el, 'visibility', 'visible', 0),
    Zanimo(
      el,
      'transform',
      'translate3d(0,0,0)', 250, 'ease-out'
    )
  ])
  .catch(console.log.bind(console))
}

export function close(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen()) router.backbutton.stack.pop()
  profileMenuOpen(false)
  isOpen(false)
  clearTimeout(pingsTimeoutID)
  if (hasNetwork()) {
    socket.send('moveLat', false)
  }
  const el = document.getElementById('side_menu')
  const bd = document.getElementById('menu-close-overlay')
  return Promise.all([
    Zanimo(bd, 'opacity', 0, 250, 'linear'),
    Zanimo(
      el,
      'transform',
      'translate3d(-100%,0,0)', 250, 'ease-out'
    )
  ])
  .then(() =>
    Promise.all([
      Zanimo(el, 'visibility', 'hidden', 0),
      Zanimo(bd, 'visibility', 'hidden', 0)
    ])
  )
  .catch(console.log.bind(console))
}

const popupActionMap = {
  gamesMenu: () => gamesMenu.open(),
  createGame: () => newGameForm.openRealTime(),
  challenge: () => challengeForm.open(),
  machine: () => playMachineForm.open(),
  friends: () => friendsPopup.open(),
}

const actionMap = {
  logout: () => {
    session.logout()
    profileMenuOpen(false)
  }
}

export type PopupAction = keyof typeof popupActionMap
export type Action = keyof typeof actionMap

export function route(route: string) {
  return function() {
    return close().then(() => router.set(route))
  }
}

export function popup(action: PopupAction) {
  return close().then(() => {
    popupActionMap[action]()
    globalRedraw()
  })
}

export function action(action: Action): void {
  actionMap[action]()
}

export function profileMenuToggle() {
  inboxXhr.inbox(false)
  .then(data => {
    inboxUnreadCount(data.currentPageResults.reduce((acc, x) =>
      (acc + (x.isUnread ? 1 : 0)), 0)
    )
    redrawMenu()
  })
  if (profileMenuOpen()) profileMenuOpen(false)
  else profileMenuOpen(true)
  redrawMenu()
}

export function getServerLags() {
  if (hasNetwork()) {
    socket.getCurrentPing()
    .then((p: number) => {
      ping(p)
      mlat(socket.getCurrentMoveLatency())
      if (isOpen()) {
        redrawMenu()
        setTimeout(getServerLags, 1000)
      }
    })
  }
}

export function getMenuWidth() {
  const vw = viewportDim().vw
  // see menu.styl
  const menuSizeRatio = vw >= 960 ? 0.35 : vw >= 500 ? 0.5 : 0.85
  return vw * menuSizeRatio
}

export function showHint(el: HTMLElement) {
  Zanimo(el, 'visibility', 'visible', 100)
  Zanimo(el, 'transform', 'translate3d(-95%, 0, 0)', 100, 'ease-out')
}

export function translateMenu(el: HTMLElement, xPos: number) {
  el.style.transform = `translate3d(${xPos}px, 0, 0)`
}

export function backdropOpacity(el: HTMLElement, opacity: number) {
  el.style.opacity = `${opacity}`
}
