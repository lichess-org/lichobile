import * as Hammer from 'hammerjs'

import MenuCtrl from './MenuCtrl'

export default function CloseSwipeHandler(menu: MenuCtrl) {

  const mc = new Hammer.Manager(menu.menuEl, {
    inputClass: Hammer.TouchInput
  })
  mc.add(new Hammer.Swipe({
    direction: Hammer.DIRECTION_HORIZONTAL,
    threshold: 10,
    velocity: 0.4
  }))

  mc.on('swipeleft', () => {
    menu.close()
  })
}
