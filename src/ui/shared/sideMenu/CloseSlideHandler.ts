import Gesture from '../../../utils/Gesture'
import { viewportDim } from '../../helper'
import SideMenuCtrl from './SideMenuCtrl'
import { getMenuWidth, translateMenu, backdropOpacity, OPEN_AFTER_SLIDE_RATIO, BACKDROP_OPACITY } from '.'

interface CloseSlideHandlerState {
  backDropElement: HTMLElement | null
  isScrolling: boolean
  isClosing: boolean
}

export default function CloseSlideHandler(el: HTMLElement, ctrl: SideMenuCtrl) {

  const side = ctrl.side
  const menuWidth = getMenuWidth()

  const state: CloseSlideHandlerState = {
    backDropElement: null,
    isScrolling: false,
    isClosing: false,
  }

  const gesture = new Gesture(el, viewportDim(), {
    passiveMove: false
  })

  gesture.on('panstart', () => {
    state.backDropElement = ctrl.getBackdropEl()
    state.isScrolling = false
    state.isClosing = false
  })
  gesture.on('panmove', (e: TouchEvent) => {

    if (state.isScrolling) return

    if (state.isClosing) {
      e.preventDefault()
    }
    else {
      if (
        (side === 'left' && gesture.touchMoveX < -5) ||
        (side === 'right' && gesture.touchMoveX > 5)
      ) {
        e.preventDefault()
        state.isClosing = true
      } else {
        state.isScrolling = Math.abs(gesture.touchMoveY) > 5
        if (state.isScrolling) return
      }
    }

    if (side === 'left') {
      if (gesture.touchMoveX < 0 && gesture.touchMoveX >= -menuWidth) {
        translateMenu(el, gesture.touchMoveX)
        backdropOpacity(state.backDropElement!, ((menuWidth + gesture.touchMoveX) / menuWidth * 100) / 100 * BACKDROP_OPACITY)
      }
    } else {
      if (gesture.touchMoveX > 0 && gesture.touchMoveX <= menuWidth) {
        translateMenu(el, gesture.touchMoveX)
        backdropOpacity(state.backDropElement!, ((menuWidth - gesture.touchMoveX) / menuWidth * 100) / 100 * BACKDROP_OPACITY)
      }
    }
  })
  gesture.on('panend', () => {
    if (state.isScrolling) return

    state.isScrolling = false
    state.isClosing = false

    // we don't want to close menu accidentaly when scrolling thus it is important
    // to check X velocity only
    const velocity = gesture.velocityX
    if (velocity !== 0) {
      if (side === 'left') {
        if (
          velocity < 0 &&
          (gesture.touchMoveX < -(menuWidth - menuWidth * OPEN_AFTER_SLIDE_RATIO) || velocity < -0.4)
        ) {
          ctrl.close()
        }
        else {
          ctrl.open()
        }
      } else {
        if (
          velocity > 0 &&
          (gesture.touchMoveX > (menuWidth - menuWidth * OPEN_AFTER_SLIDE_RATIO) || velocity > 0.4)
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
