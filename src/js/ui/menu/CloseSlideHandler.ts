import * as Hammer from 'hammerjs'
import * as helper from '../helper'
import { open, close, translateMenu, backdropOpacity, OPEN_AFTER_SLIDE_RATIO } from '.'

interface CloseSlideHandlerState {
  backDropElement: HTMLElement | null
  startingPos: number
  isScrolling: boolean
}

export default function CloseSlideHandler(el: HTMLElement) {

  const vw = helper.viewportDim().vw
  // see menu.styl
  const menuSizeRatio = vw >= 960 ? 0.35 : vw >= 500 ? 0.5 : 0.85
  const maxSlide = vw * menuSizeRatio

  const state: CloseSlideHandlerState = {
    backDropElement: null,
    startingPos: 0,
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
    state.backDropElement = document.getElementById('menu-close-overlay')
    state.startingPos = e.center.y
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
        state.isScrolling = Math.abs(state.startingPos - e.center.y) > 5

        if (state.isScrolling) return
      }

      if (e.deltaX < 0 && e.deltaX >= -maxSlide) {
        translateMenu(el, e.deltaX)
        backdropOpacity(state.backDropElement!, ((maxSlide + e.deltaX) / maxSlide * 100) / 100 / 2)
      }
    }
  })
  mc.on('panend pancancel', (e: HammerInput) => {
    if (!state.isScrolling) {
      state.isScrolling = false
      // we don't want to close menu accidentaly when scrolling thus it is important
      // to check X velocity only
      const velocity = e.velocityX
      if (
        velocity <= 0 &&
        (e.deltaX < -(maxSlide - maxSlide * OPEN_AFTER_SLIDE_RATIO) || velocity < -0.4)
      ) {
        close()
      }
      else {
        open()
      }
    }
  })
}
