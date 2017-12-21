import * as Hammer from 'hammerjs'
import redraw from '../../utils/redraw'
import * as menu from '.'

export const EDGE_SLIDE_THRESHOLD = 40

interface OpenSlideHandlerState {
  menuElement: HTMLElement | null
  backDropElement: HTMLElement | null
  canSlide: boolean
}

export default function OpenSlideHandler(
  mainEl: HTMLElement
) {

  const maxSlide = menu.getMenuWidth()

  const state: OpenSlideHandlerState = {
    menuElement: null,
    backDropElement: null,
    canSlide: false
  }

  const mc = new Hammer.Manager(mainEl, {
    inputClass: Hammer.TouchInput
  })
  mc.add(new Hammer.Pan({
    direction: Hammer.DIRECTION_HORIZONTAL,
    threshold: 5
  }))

  mc.on('panstart', (e: HammerInput) => {
    if (
      e.target.nodeName === 'PIECE' ||
      e.target.nodeName === 'SQUARE' ||
      // svg element className is not a string
      (e.target.className.startsWith && e.target.className.startsWith('cg-board manipulable')) ||
      e.center.x > EDGE_SLIDE_THRESHOLD
    ) {
      state.canSlide = false
    } else {
      state.menuElement = document.getElementById('side_menu')
      state.backDropElement = document.getElementById('menu-close-overlay')
      if (state.menuElement && state.backDropElement) {
        state.menuElement.style.visibility = 'visible'
        state.backDropElement.style.visibility = 'visible'
        state.canSlide = true
        menu.isSliding(true)
        redraw()
      }
    }
  })
  mc.on('panmove', (e: HammerInput) => {
    if (state.canSlide) {
      // disable scrolling of content when sliding menu
      e.preventDefault()
      const delta = e.deltaX
      if (delta <= maxSlide) {
        menu.translateMenu(state.menuElement!, -maxSlide + delta)
        menu.backdropOpacity(state.backDropElement!, (delta / maxSlide * 100) / 100 / 2)
      }
    }
  })
  mc.on('panend pancancel', (e: HammerInput) => {
    if (state.canSlide) {
      menu.isSliding(false)
      state.canSlide = false
      const velocity = e.velocityX
      const delta = e.deltaX
      if (
        velocity >= 0 &&
        (delta >= maxSlide * menu.OPEN_AFTER_SLIDE_RATIO || velocity > 0.2)
      ) {
        menu.open()
      } else {
        menu.close()
      }
    }
  })
}

