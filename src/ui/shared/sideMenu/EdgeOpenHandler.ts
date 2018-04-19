import redraw from '../../../utils/redraw'
import { viewportDim } from '../../helper'
import { getMenuWidth, translateMenu, backdropOpacity, EDGE_SLIDE_THRESHOLD, OPEN_AFTER_SLIDE_RATIO } from '.'

import SideMenuCtrl, { Side } from './SideMenuCtrl'

interface State {
  menuElement: HTMLElement | null
  backDropElement: HTMLElement | null
  canSlide: boolean
}

export interface HammerHandlers {
  [eventName: string]: (e: HammerInput) => void
}

export default function EdgeOpenHandler(ctrl: SideMenuCtrl): HammerHandlers {
  const side = ctrl.side
  const vw = viewportDim().vw
  const menuWidth = getMenuWidth()

  const state: State = {
    menuElement: null,
    backDropElement: null,
    canSlide: false
  }


  return {
    panstart: (e: HammerInput) => {
      if (
        e.target.nodeName === 'PIECE' ||
        e.target.nodeName === 'SQUARE' ||
        // svg element className is not a string
        (e.target.className.startsWith && e.target.className.startsWith('cg-board manipulable')) ||
        !inEdgeArea(e.center.x, side, vw)
      ) {
        state.canSlide = false
      } else {
        state.menuElement = ctrl.getMenuEl()
        state.backDropElement = ctrl.getBackdropEl()
        if (state.menuElement && state.backDropElement) {
          state.menuElement.style.visibility = 'visible'
          state.backDropElement.style.visibility = 'visible'
          state.canSlide = true
          redraw()
        }
      }
    },

    panmove: (e: HammerInput) => {
      if (state.canSlide) {
        // disable scrolling of content when sliding menu
        e.preventDefault()
        const delta = e.deltaX
        if (side === 'left') {
          if (delta <= menuWidth) {
            translateMenu(state.menuElement!, -menuWidth + delta)
            backdropOpacity(state.backDropElement!, (delta / menuWidth * 100) / 100 / 2)
          }
        } else {
          if (delta >= -menuWidth) {
            translateMenu(state.menuElement!, menuWidth + delta)
            backdropOpacity(state.backDropElement!, (-delta / menuWidth * 100) / 100 / 2)
          }
        }
      }
    },

    'panend pancancel': (e: HammerInput) => {
      if (state.canSlide) {
        state.canSlide = false
        const velocity = e.velocityX
        const delta = e.deltaX
        if (side === 'left') {
          if (
            velocity >= 0 &&
            (delta >= menuWidth * OPEN_AFTER_SLIDE_RATIO || velocity > 0.2)
          ) {
            ctrl.open()
          } else {
            ctrl.close()
          }
        } else {
          if (
            velocity <= 0 &&
            (delta <= -(menuWidth * OPEN_AFTER_SLIDE_RATIO) || velocity < -0.2)
          ) {
            ctrl.open()
          } else {
            ctrl.close()
          }
        }
      }
    }
  }
}

function inEdgeArea(inputPos: number, side: Side, vw: number) {
  return side === 'left' ?
    inputPos < EDGE_SLIDE_THRESHOLD :
    inputPos > vw - EDGE_SLIDE_THRESHOLD
}
