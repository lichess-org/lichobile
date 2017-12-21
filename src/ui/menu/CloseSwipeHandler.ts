import * as Hammer from 'hammerjs'
import * as menu from '.'

export default function CloseSwipeHandler(el: HTMLElement) {

  const mc = new Hammer.Manager(el, {
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
