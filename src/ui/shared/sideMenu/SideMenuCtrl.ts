import Zanimo from '../../../utils/zanimo'
import redraw from '../../../utils/redraw'
import router from '../../../router'

import { BACKDROP_OPACITY } from '.'

export type Side = 'left' | 'right'

export default class SideMenuCtrl {
  public isOpen = false
  public readonly side: Side

  private readonly menuID: string
  private readonly backdropID: string
  private readonly onOpen?: () => void
  private readonly onClose?: () => void

  public constructor(
    side: Side,
    menuID: string,
    backdropID: string,
    onOpen?: () => void,
    onClose?: () => void
  ) {
    this.side = side
    this.menuID = menuID
    this.backdropID = backdropID
    this.onOpen = onOpen
    this.onClose = onClose
  }

  public readonly open = () => {
    this.isOpen = true
    router.backbutton.stack.push(this.close)
    const el = document.getElementById(this.menuID)!
    const bd = document.getElementById(this.backdropID)!
    if (this.onOpen) this.onOpen()
    return Promise.all([
      Zanimo(bd, 'visibility', 'visible', 0),
      Zanimo(bd, 'opacity', BACKDROP_OPACITY, 250, 'linear'),
      Zanimo(el, 'visibility', 'visible', 0),
      Zanimo(
        el,
        'transform',
        'translate3d(0,0,0)', 250, 'ease-out'
      )
    ])
    .then(redraw)
    .catch(console.error.bind(console))
  }

  public readonly close = (fromBB?: string) => {
    if (fromBB !== 'backbutton' && this.isOpen) router.backbutton.stack.pop()
    this.isOpen = false
    const el = document.getElementById(this.menuID)!
    const bd = document.getElementById(this.backdropID)!
    if (this.onClose) this.onClose()
    return Promise.all([
      Zanimo(bd, 'opacity', 0, 250, 'linear'),
      Zanimo(
        el,
        'transform',
        this.closeTranslate(), 250, 'ease-out'
      )
    ])
    .then(() =>
      Promise.all([
        Zanimo(el, 'visibility', 'hidden', 0),
        Zanimo(bd, 'visibility', 'hidden', 0)
      ])
    )
    .catch(console.error.bind(console))
  }

  public readonly toggle = (e: TouchEvent) => {
    e.stopPropagation()
    if (this.isOpen) this.close()
    else this.open()
  }

  public getMenuEl(): HTMLElement | null {
    return document.getElementById(this.menuID)
  }

  public getBackdropEl(): HTMLElement | null {
    return document.getElementById(this.backdropID)
  }

  // ---

  private readonly closeTranslate = () =>
    this.side === 'left' ? 'translate3d(-100%,0,0)' : 'translate3d(100%,0,0)'
}
