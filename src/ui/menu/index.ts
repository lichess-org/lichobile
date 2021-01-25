import { hasNetwork, prop } from '../../utils'
import redraw from '../../utils/redraw'
import router from '../../router'
import socket from '../../socket'
import { unreadCount as fetchUnreadCount } from '../msg/network'
import { ontap } from '../helper'
import SideMenuCtrl from '../shared/sideMenu/SideMenuCtrl'

let pingsTimeoutID: number

export const inboxUnreadCount = prop(0)
export const profileMenuOpen = prop(false)
export const mlat = prop(0)
export const ping = prop(0)

function onMenuOpen() {
  if (hasNetwork()) {
    socket.sendNoCheck('moveLat', true)
  }
  pingsTimeoutID = setTimeout(getServerLags, 2000)
}

function onMenuClose() {
  profileMenuOpen(false)
  clearTimeout(pingsTimeoutID)
  if (hasNetwork()) {
    socket.sendNoCheck('moveLat', false)
  }
}

export const mainMenuCtrl = new SideMenuCtrl(
  'left',
  'side_menu',
  'menu-close-overlay',
  onMenuOpen,
  onMenuClose
)

export function route(route: string) {
  return function() {
    return mainMenuCtrl.close().then(() => router.set(route))
  }
}

export function action(f: () => void) {
  return function() {
    return mainMenuCtrl.close().then(() => {
      f()
      redraw()
    })
  }
}

export function toggleHeader() {
  const open = !profileMenuOpen()
  if (open) {
    fetchUnreadCount()
    .then(nb => {
      inboxUnreadCount(nb)
      redraw()
    })
  }
  profileMenuOpen(open)
}

export function getServerLags() {
  if (hasNetwork()) {
    socket.getCurrentPing()
    .then((p: number) => {
      ping(p)
      mlat(socket.getCurrentMoveLatency())
      if (mainMenuCtrl.isOpen) {
        redraw()
        setTimeout(getServerLags, 2000)
      }
    })
  }
}

export const backdropCloseHandler = ontap((e: TouchEvent) => {
  e.stopPropagation()
  mainMenuCtrl.close()
})
