import * as stream from 'mithril/stream'
import { hasNetwork } from '../../utils'
import redraw from '../../utils/redraw'
import router from '../../router'
import socket from '../../socket'
import * as inboxXhr from '../inbox/inboxXhr'
import { ontap } from '../helper'
import SideMenuCtrl from '../shared/sideMenu/SideMenuCtrl'

let pingsTimeoutID: number

export const inboxUnreadCount = stream(0)
export const profileMenuOpen = stream(false)
export const mlat = stream(0)
export const ping = stream(0)

function onMenuOpen() {
  if (hasNetwork()) {
    socket.send('moveLat', true)
  }
  pingsTimeoutID = setTimeout(getServerLags, 2000)
}

function onMenuClose() {
  profileMenuOpen(false)
  clearTimeout(pingsTimeoutID)
  if (hasNetwork()) {
    socket.send('moveLat', false)
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

export function popup(action: () => void) {
  return function() {
    return mainMenuCtrl.close().then(() => {
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

export const backdropCloseHandler = ontap(() => {
  mainMenuCtrl.close()
})
