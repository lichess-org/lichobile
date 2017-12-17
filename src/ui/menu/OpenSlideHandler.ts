import * as Hammer from 'hammerjs'
import * as menu from '.'
import redrawMenu from './redraw'

interface OpenSlideHandlerState {
  menuElement: HTMLElement | null
  backDropElement: HTMLElement | null
  canSlide: boolean
  hintedX: number | null
}

export default function OpenSlideHandler(
  mainEl: HTMLElement
) {

  const maxSlide = menu.getMenuWidth()

  const state: OpenSlideHandlerState = {
    menuElement: null,
    backDropElement: null,
    canSlide: false,
    hintedX: null
  }

  const mc = new Hammer.Manager(mainEl, {
    inputClass: Hammer.TouchInput
  })
  mc.add(new Hammer.Pan({
    direction: Hammer.DIRECTION_HORIZONTAL,
    threshold: 0
  }))
  mc.add(new Hammer.Press())

  mc.on('press', (e: HammerInput) => {
    state.menuElement = document.getElementById('side_menu')
    if (state.menuElement && !menu.isSliding()) {
      menu.showHint(state.menuElement)
      state.hintedX = e.center.x
    }
  })

  mc.on('hammer.input', (e: HammerInput) => {
    // handle both press end and pan end
    if (e.eventType === Hammer.INPUT_END || e.eventType === Hammer.INPUT_CANCEL) {
      state.hintedX = null
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
      } else {
        menu.close()
      }
    }
  })

  mc.on('panstart', (e: HammerInput) => {
    if (
      e.target.nodeName === 'PIECE' ||
      e.target.nodeName === 'SQUARE' ||
      // svg element className is not a string
      (e.target.className.startsWith && e.target.className.startsWith('cg-board manipulable'))
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
        redrawMenu()
      }
    }
  })
  mc.on('panmove', (e: HammerInput) => {
    if (state.canSlide) {
      // disable scrolling of content when sliding menu
      e.preventDefault()
      const delta = e.deltaX
      if (delta <= maxSlide) {
        const shift = state.hintedX !== null ? maxSlide * 0.05 - state.hintedX : 0
        menu.translateMenu(state.menuElement!, -maxSlide + delta + shift)
        menu.backdropOpacity(state.backDropElement!, (delta / maxSlide * 100) / 100 / 2)
      }
    }
  })
}

