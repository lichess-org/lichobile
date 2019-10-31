import { Capacitor } from '@capacitor/core'
import TinyGesture from '../../../utils/gesture/TinyGesture'
import { viewportDim } from '../../helper'
import SideMenuCtrl from './SideMenuCtrl'
import { getMenuWidth, translateMenu, backdropOpacity, OPEN_AFTER_SLIDE_RATIO, BACKDROP_OPACITY } from '.'

interface CloseSlideHandlerState {
  backDropElement: HTMLElement | null
}

export default function CloseSlideHandler(el: HTMLElement, ctrl: SideMenuCtrl) {

  const side = ctrl.side
  const menuWidth = getMenuWidth()

  const state: CloseSlideHandlerState = {
    backDropElement: null,
  }

  const gesture = new TinyGesture(el, viewportDim(), {
    passiveMove: Capacitor.platform !== 'ios'
  })

  gesture.on('panstart', () => {
    state.backDropElement = ctrl.getBackdropEl()
  })
  gesture.on('panmove', (e: TouchEvent) => {
    if (Capacitor.platform === 'ios') {
      if (!e.defaultPrevented) {
        if (
          (side === 'left' && gesture.touchMoveX < -8) ||
          (side === 'right' && gesture.touchMoveX > 8)
        ) {
          e.preventDefault()
        }
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
    // we don't want to close menu accidentaly when scrolling thus it is important
    // to check X velocity only
    const velocity = gesture.velocityX
    if (velocity !== null) {
      if (side === 'left') {
        if (
          velocity <= 0 &&
          (gesture.touchMoveX < -(menuWidth - menuWidth * OPEN_AFTER_SLIDE_RATIO) || velocity < -0.4)
        ) {
          ctrl.close()
        }
        else {
          ctrl.open()
        }
      } else {
        if (
          velocity >= 0 &&
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
