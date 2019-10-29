import { viewportDim } from '../../helper'

export const OPEN_AFTER_SLIDE_RATIO = 0.6
export const EDGE_SLIDE_THRESHOLD = 25
export const BACKDROP_OPACITY = 0.7

export function getMenuWidth() {
  const vw = viewportDim().vw
  // see menu.styl
  const menuSizeRatio = vw >= 960 ? 0.35 : vw >= 500 ? 0.5 : 0.85
  return vw * menuSizeRatio
}

export function translateMenu(el: HTMLElement, xPos: number) {
  el.style.transform = `translate3d(${xPos}px, 0, 0)`
}

export function backdropOpacity(el: HTMLElement, opacity: number) {
  el.style.opacity = `${opacity}`
}
