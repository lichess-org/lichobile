import * as Zanimo from 'zanimo'
import * as Hammer from 'hammerjs'
import { hasNetwork } from '../../utils'
import session from '../../session'
import redraw from '../../utils/redraw'
import router from '../../router'
import socket from '../../socket'
import * as inboxXhr from '../inbox/inboxXhr'
import * as stream from 'mithril/stream'

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

export function SlideHandler(
  el: HTMLElement,
  onStart: () => void,
  onMove: () => void,
  onEnd: () => void
) {
  const mc = new Hammer.Manager(el)
  mc.add(new Hammer.Pan({
    direction: Hammer.DIRECTION_HORIZONTAL,
    threshold: 5
  }))

  mc.on('panstart', onStart)
  mc.on('panmove', onMove)
  mc.on('panend', onEnd)

  return {
    destroy: () => {
      mc.off('panstart', onStart)
      mc.off('panmove', onMove)
      mc.off('panend', onEnd)
    }
  }
}
