import * as Hammer from 'hammerjs'
import * as menu from '.'

interface CloseSlideHandlerState {
  backDropElement: HTMLElement | null
  startingY: number
  isScrolling: boolean
}

export default function CloseSlideHandler(el: HTMLElement) {

  const maxSlide = menu.getMenuWidth()

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
    state.backDropElement = document.getElementById('menu-close-overlay')
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

      if (e.deltaX < 0 && e.deltaX >= -maxSlide) {
        menu.translateMenu(el, e.deltaX)
        menu.backdropOpacity(state.backDropElement!, ((maxSlide + e.deltaX) / maxSlide * 100) / 100 / 2)
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
        (e.deltaX < -(maxSlide - maxSlide * menu.OPEN_AFTER_SLIDE_RATIO) || velocity < -0.4)
      ) {
        menu.close()
      }
      else {
        menu.open()
      }
    }
  })
}
