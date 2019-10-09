import Hammer from 'hammerjs'

import SideMenuCtrl from './SideMenuCtrl'

export default function CloseSwipeHandler(el: HTMLElement, ctrl: SideMenuCtrl) {

  const mc = new Hammer.Manager(el, {
    inputClass: Hammer.TouchInput
  })
  mc.add(new Hammer.Swipe({
    direction: Hammer.DIRECTION_HORIZONTAL,
    threshold: 10,
    velocity: 0.4
  }))

  const swipeDirection = ctrl.side === 'left' ? 'swipeleft' : 'swiperight'

  mc.on(swipeDirection, () => {
    ctrl.close()
  })
}
