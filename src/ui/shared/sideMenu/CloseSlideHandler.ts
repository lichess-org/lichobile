import Hammer from 'hammerjs'

import { getMenuWidth, translateMenu, backdropOpacity, OPEN_AFTER_SLIDE_RATIO, BACKDROP_OPACITY } from '.'
import SideMenuCtrl from './SideMenuCtrl'

interface CloseSlideHandlerState {
  backDropElement: HTMLElement | null
  startingY: number
  isScrolling: boolean
}

export default function CloseSlideHandler(el: HTMLElement, ctrl: SideMenuCtrl) {

  const side = ctrl.side
  const menuWidth = getMenuWidth()

  const state: CloseSlideHandlerState = {
    backDropElement: null,
    startingY: 0,
    isScrolling: false
  }

  const mc = new Hammer.Manager(el, {
    inputClass: Hammer.TouchInput
  })
  mc.add(new Hammer.Pan({
    direction: Hammer.DIRECTION_HORIZONTAL,
    threshold: 10
  }))

  mc.on('panstart', (e: HammerInput) => {
    state.backDropElement = ctrl.getBackdropEl()
    state.startingY = e.center.y
    state.isScrolling = false
  })
  mc.on('panmove', (e: HammerInput) => {
    // if scrolling shutdown everything
    if (!state.isScrolling) {
      // disable scrolling of content when sliding menu
      e.preventDefault()

      // if not already scroll prevented check if scrolling
      if (!e.srcEvent.defaultPrevented) {
        // set scrolling if moved vertically by more than scroll threshold
        state.isScrolling = Math.abs(state.startingY - e.center.y) > 5

        if (state.isScrolling) return
      }

      if (side === 'left') {
        if (e.deltaX < 0 && e.deltaX >= -menuWidth) {
          translateMenu(el, e.deltaX)
          backdropOpacity(state.backDropElement!, ((menuWidth + e.deltaX) / menuWidth * 100) / 100 * BACKDROP_OPACITY)
        }
      } else {
        if (e.deltaX > 0 && e.deltaX <= menuWidth) {
          translateMenu(el, e.deltaX)
          backdropOpacity(state.backDropElement!, ((menuWidth - e.deltaX) / menuWidth * 100) / 100 * BACKDROP_OPACITY)
        }
      }
    }
  })
  mc.on('panend pancancel', (e: HammerInput) => {
    if (!state.isScrolling) {
      state.isScrolling = false
      // we don't want to close menu accidentaly when scrolling thus it is important
      // to check X velocity only
      const velocity = e.velocityX
      if (side === 'left') {
        if (
          velocity <= 0 &&
          (e.deltaX < -(menuWidth - menuWidth * OPEN_AFTER_SLIDE_RATIO) || velocity < -0.4)
        ) {
          ctrl.close()
        }
        else {
          ctrl.open()
        }
      } else {
        if (
          velocity >= 0 &&
          (e.deltaX > (menuWidth - menuWidth * OPEN_AFTER_SLIDE_RATIO) || velocity > 0.4)
        ) {
          ctrl.close()
        }
        else {
          ctrl.open()
        }
      }
    }
  })
}
