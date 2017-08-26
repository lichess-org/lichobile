import * as stream from 'mithril/stream'
import * as Zanimo from 'zanimo'
import * as Hammer from 'hammerjs'
import { hasNetwork } from '../../utils'
import session from '../../session'
import redraw from '../../utils/redraw'
import router from '../../router'
import socket from '../../socket'
import * as helper from '../helper'
import * as inboxXhr from '../inbox/inboxXhr'

const OPEN_AFTER_SLIDE_RATIO = 0.65
const MAX_EDGE_CAN_SLIDE = 30

let pingsTimeoutID: number

export const inboxUnreadCount = stream(0)
export const profileMenuOpen = stream(false)
export const isOpen = stream(false)
export const mlat = stream(0)
export const ping = stream(0)

export function toggle() {
  if (isOpen()) close()
  else open()
}

export function open() {
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
  .then(redraw)
  .catch(console.log.bind(console))
}

export function close(fromBB?: string) {
  profileMenuOpen(false)
  isOpen(false)
  if (fromBB !== 'backbutton' && isOpen()) router.backbutton.stack.pop()
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

export function route(route: string) {
  return function() {
    return close().then(() => router.set(route))
  }
}

export function popup(action: () => void) {
  return function() {
    return close().then(() => {
      action()
      redraw()
    })
  }
}

export function toggleHeader() {
  inboxXhr.inbox(false)
  .then(data => {
    inboxUnreadCount(data.currentPageResults.reduce((acc, x) =>
      (acc + (x.isUnread ? 1 : 0)), 0)
    )
    redraw()
  })
  return profileMenuOpen() ? profileMenuOpen(false) : profileMenuOpen(true)
}

export function getServerLags() {
  if (hasNetwork() && session.isConnected()) {
    socket.getCurrentPing()
    .then((p: number) => {
      ping(p)
      mlat(socket.getCurrentMoveLatency())
      if (isOpen()) {
        redraw()
        setTimeout(getServerLags, 1000)
      }
    })
  }
}

function translateMenu(el: HTMLElement, xPos: number) {
  el.style.transform = `translate3d(${xPos}px, 0, 0)`
}

function backdropOpacity(el: HTMLElement, opacity: number) {
  el.style.opacity = `${opacity}`
}

interface SlideHandlerState {
  menuElement: HTMLElement | null
  backDropElement: HTMLElement | null
  canSlide: boolean
}

export function SlideHandler(
  mainEl: HTMLElement
) {

  const vw = helper.viewportDim().vw
  // see menu.styl
  const menuSizeRatio = vw >= 960 ? 0.35 : vw >= 500 ? 0.5 : 0.85
  const maxSlide = vw * menuSizeRatio

  const state: SlideHandlerState = {
    menuElement: null,
    backDropElement: null,
    canSlide: false
  }

  const mc = new Hammer.Manager(mainEl, {
    inputClass: Hammer.TouchInput
  })
  mc.add(new Hammer.Pan({
    direction: Hammer.DIRECTION_HORIZONTAL,
    pointers: 1,
    threshold: 5
  }))

  mc.on('panstart', (e: HammerInput) => {
    if (e.center.x > MAX_EDGE_CAN_SLIDE) {
      state.canSlide = false
    } else {
      state.menuElement = document.getElementById('side_menu')
      state.backDropElement = document.getElementById('menu-close-overlay')
      if (state.menuElement && state.backDropElement) {
        state.menuElement.style.visibility = 'visible'
        state.backDropElement.style.visibility = 'visible'
        state.canSlide = true
      }
    }
  })
  mc.on('panmove', (e: HammerInput) => {
    if (state.canSlide) {
      // disable scrolling of content when sliding menu
      e.preventDefault()
      if (e.center.x <= maxSlide) {
        translateMenu(state.menuElement!, -maxSlide + e.center.x)
        backdropOpacity(state.backDropElement!, (e.center.x / maxSlide * 100) / 100 / 2)
      }
    }
  })
  mc.on('panend pancancel', (e: HammerInput) => {
    if (state.canSlide) {
      const velocity = e.velocity
      if (
        velocity >=0 &&
        (e.center.x >= maxSlide * OPEN_AFTER_SLIDE_RATIO || velocity > 0.4)
      ) open()
      else close()
    }
  })
}
