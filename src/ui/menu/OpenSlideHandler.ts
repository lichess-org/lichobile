import * as Hammer from 'hammerjs'

import MenuCtrl from './MenuCtrl'

interface OpenSlideHandlerState {
  canSlide: boolean
  hintedX: number | null
}

export default function OpenSlideHandler(
  menu: MenuCtrl
) {

  const maxSlide = menu.getMenuWidth()

  const state: OpenSlideHandlerState = {
    canSlide: false,
    hintedX: null
  }

  const mc = new Hammer.Manager(menu.edgeEl, {
    inputClass: Hammer.TouchInput
  })
  mc.add(new Hammer.Pan({
    direction: Hammer.DIRECTION_HORIZONTAL,
    threshold: 0
  }))
  mc.add(new Hammer.Press())

  mc.on('press', (e: HammerInput) => {
    if (!menu.isSliding) {
      menu.showHint()
      state.hintedX = e.center.x
    }
  })

  mc.on('hammer.input', (e: HammerInput) => {
    // handle both press end and pan end
    if (e.eventType === Hammer.INPUT_END || e.eventType === Hammer.INPUT_CANCEL) {
      state.hintedX = null
      if (state.canSlide) {
        menu.isSliding = false
        state.canSlide = false
        const velocity = e.velocityX
        const delta = e.deltaX
        if (
          velocity >= 0 &&
          (delta >= maxSlide * MenuCtrl.OPEN_AFTER_SLIDE_RATIO || velocity > 0.2)
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
      menu.menuEl.style.visibility = 'visible'
      menu.backdropEl.style.visibility = 'visible'
      state.canSlide = true
      menu.isSliding = true
      MenuCtrl.redraw()
    }
  })
  mc.on('panmove', (e: HammerInput) => {
    if (state.canSlide) {
      // disable scrolling of content when sliding menu
      e.preventDefault()
      const delta = e.deltaX
      if (delta <= maxSlide) {
        const shift = state.hintedX !== null ? maxSlide * 0.05 - state.hintedX : 0
        menu.translateMenu(-maxSlide + delta + shift)
        menu.backdropOpacity((delta / maxSlide * 100) / 100 / 2)
      }
    }
  })
}

