import * as Zanimo from 'zanimo'
import { hasNetwork } from '../../utils'
import router from '../../router'
import session from '../../session'
import socket from '../../socket'
import signals from '../../signals'
import globalRedraw from '../../utils/redraw'
import { batchRequestAnimationFrame } from '../../utils/batchRAF'
import newGameForm from '../newGameForm'
import gamesMenu from '../gamesMenu'
import friendsPopup from '../friendsPopup'
import challengeForm from '../challengeForm'
import playMachineForm from '../playMachineForm'
import * as inboxXhr from '../inbox/inboxXhr'
import { viewportDim } from '../helper'
import ButtonHandler from '../helper/button'

import OpenSlideHandler from './OpenSlideHandler'
import CloseSlideHandler from './CloseSlideHandler'
import CloseSwipeHandler from './CloseSwipeHandler'

export type PopupAction = keyof typeof popupActionMap
export type Action = keyof typeof actionMap

export default class MenuCtrl {
  inboxUnreadCount: number = 0
  profileMenuOpen: boolean = false
  isSliding: boolean = false
  mlat: number = 0
  ping: number = 0
  pingsTimeoutID: number

  menuEl: HTMLElement
  edgeEl: HTMLElement
  backdropEl: HTMLElement

  isOpen: boolean = false

  static action(ctrl: MenuCtrl, action: Action): void {
    actionMap[action](ctrl)
  }

  static redraw() {
    batchRequestAnimationFrame(signals.redrawMenu.dispatch)
  }

  static OPEN_AFTER_SLIDE_RATIO = 0.6

  constructor(el: HTMLElement, edgeEl: HTMLElement, backdropEl: HTMLElement) {
    this.menuEl = el
    this.edgeEl = edgeEl
    this.backdropEl = backdropEl

    OpenSlideHandler(this)
    ButtonHandler(this.backdropEl, () => this.close())
    if (window.cordova.platformId === 'ios') {
      CloseSwipeHandler(this)
    } else {
      CloseSlideHandler(this)
    }
  }

  open() {
    MenuCtrl.redraw()
    this.isOpen = true
    router.backbutton.stack.push(this.close)
    if (hasNetwork()) {
      socket.send('moveLat', true)
    }
    this.pingsTimeoutID = setTimeout(this.getServerLags, 1000)
    const bd = document.getElementById('menu-close-overlay')

    return Promise.all([
      Zanimo(bd, 'visibility', 'visible', 0),
      Zanimo(bd, 'opacity', 0.5, 250, 'linear'),
      Zanimo(this.menuEl, 'visibility', 'visible', 0),
      Zanimo(
        this.menuEl,
        'transform',
        'translate3d(0,0,0)', 250, 'ease-out'
      )
    ])
    .catch(console.log.bind(console))
  }

  close(fromBB?: string) {
    if (fromBB !== 'backbutton' && this.isOpen) router.backbutton.stack.pop()
    this.profileMenuOpen = false
    this.isOpen = false
    clearTimeout(this.pingsTimeoutID)
    if (hasNetwork()) {
      socket.send('moveLat', false)
    }
    const bd = document.getElementById('menu-close-overlay')

    return Promise.all([
      Zanimo(bd, 'opacity', 0, 250, 'linear'),
      Zanimo(
        this.menuEl,
        'transform',
        'translate3d(-100%,0,0)', 250, 'ease-out'
      )
    ])
    .then(() =>
      Promise.all([
        Zanimo(this.menuEl, 'visibility', 'hidden', 0),
        Zanimo(bd, 'visibility', 'hidden', 0)
      ])
    )
    .catch(console.log.bind(console))
  }

  route = (route: string) => () => this.close().then(() => router.set(route))

  popup = (action: PopupAction) => this.close().then(() => {
    popupActionMap[action]()
    globalRedraw()
  })

  profileMenuToggle = () => {
    inboxXhr.inbox(false)
    .then(data => {
      this.inboxUnreadCount = data.currentPageResults.reduce((acc, x) =>
        (acc + (x.isUnread ? 1 : 0)), 0)

      MenuCtrl.redraw()
    })
    if (this.profileMenuOpen) this.profileMenuOpen = false
    else this.profileMenuOpen = true

    MenuCtrl.redraw()
  }

  getMenuWidth() {
    const vw = viewportDim().vw
    // see menu.styl
    const menuSizeRatio = vw >= 960 ? 0.35 : vw >= 500 ? 0.5 : 0.85
    return vw * menuSizeRatio
  }

  showHint() {
    Zanimo(this.menuEl, 'visibility', 'visible', 100)
    Zanimo(this.menuEl, 'transform', 'translate3d(-95%, 0, 0)', 100, 'ease-out')
  }

  translateMenu(xPos: number) {
    this.menuEl.style.transform = `translate3d(${xPos}px, 0, 0)`
  }

  backdropOpacity(opacity: number) {
    this.backdropEl.style.opacity = `${opacity}`
  }

  private getServerLags = () => {
    if (hasNetwork()) {
      socket.getCurrentPing()
      .then((p: number) => {
        this.ping = p
        this.mlat = socket.getCurrentMoveLatency()
        if (this.isOpen) {
          MenuCtrl.redraw()
          setTimeout(this.getServerLags, 1000)
        }
      })
    }
  }
}

const popupActionMap = {
  gamesMenu: () => gamesMenu.open(),
  createGame: () => newGameForm.openRealTime(),
  challenge: () => challengeForm.open(),
  machine: () => playMachineForm.open(),
  friends: () => friendsPopup.open(),
}

const actionMap = {
  logout: (ctrl: MenuCtrl) => {
    session.logout()
    ctrl.profileMenuOpen = false
  }
}
