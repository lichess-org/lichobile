import h from 'mithril/hyperscript'
import Zanimo from '../../utils/zanimo'
import * as utils from '../../utils'
import redraw from '../../utils/redraw'
import router from '../../router'
import ButtonHandler from './button'
import { UserGamePlayer } from '../../lichess/interfaces/user'
import { Player } from '../../lichess/interfaces/game'

export interface ViewportDim {
  vw: number
  vh: number
}

export interface SafeAreaInset {
  top: number
  right: number
  bottom: number
  left: number
}

const animDuration = 250

// this must be cached because of the access to document.body.style
let cachedTransformProp: string
let cachedIsPortrait: boolean | undefined
let cachedViewportDim: ViewportDim | null = null

export const headerHeight = 56
export const footerHeight = 45

export function onPageEnter(anim: (el: HTMLElement) => void) {
  return ({ dom }: Mithril.VnodeDOM<any, any>) => anim(dom as HTMLElement)
}

// because mithril will call 'onremove' asynchronously when the component has
// an 'onbeforeremove' hook, some cleanup tasks must be done in the latter hook
// thus this helper
export function onPageLeave(anim: (el: HTMLElement) => Promise<void>, cleanup?: () => void) {
  return function({ dom }: Mithril.VnodeDOM<any, any>, done: () => void) {
    if (cleanup) cleanup()
    return anim(dom as HTMLElement)
    .then(done)
    .catch(done)
  }
}

// el fade in transition, can be applied to any element
export function elFadeIn(el: HTMLElement, duration = animDuration, origOpacity = '0.5', endOpacity = '1') {
  let tId: number | undefined = undefined

  el.style.opacity = origOpacity
  el.style.transition = `opacity ${duration}ms ease-out`

  setTimeout(() => {
    el.style.opacity = endOpacity
  })

  function after() {
    clearTimeout(tId)
    if (el) {
      el.removeAttribute('style')
      el.removeEventListener('transitionend', after, false)
    }
  }

  el.addEventListener('transitionend', after, false)
  // in case transitionend does not fire
  tId = setTimeout(after, duration + 10)
}

// page slide transition
// apply only to page change transitions
// they listen to history to determine if animation is going forward or backward
export function pageSlideIn(el: HTMLElement) {
  let tId: number | undefined = undefined

  function after() {
    clearTimeout(tId )
    if (el) {
      el.removeAttribute('style')
      el.removeEventListener('transitionend', after, false)
    }
  }

  const direction = router.getViewSlideDirection() === 'fwd' ? '100%' : '-100%'
  el.style.transform = `translate3d(${direction},0,0)`

  setTimeout(() => {
    el.style.transition = `transform ${animDuration}ms ease-out`
    el.style.transform = 'translate3d(0%,0,0)'
  }, 10)

  el.addEventListener('transitionend', after, false)
  // in case transitionend does not fire
  tId = setTimeout(after, animDuration + 20)
}

export function elSlideIn(el: HTMLElement, dir: 'left' | 'right') {
  let tId: number | undefined = undefined

  function after() {
    clearTimeout(tId)
    if (el) {
      el.removeAttribute('style')
      el.removeEventListener('transitionend', after, false)
    }
  }

  const trans = dir === 'left' ? '100%' : '-100%'
  el.style.transform = `translate3d(${trans},0,0)`

  setTimeout(() => {
    el.style.transition = `transform ${animDuration}ms ease-out`
    el.style.transform = 'translate3d(0%,0,0)'
  }, 10)

  el.addEventListener('transitionend', after, false)
  // in case transitionend does not fire
  tId = setTimeout(after, animDuration + 20)
}

export function elFadeOut(el: HTMLElement) {
  return Zanimo(el, 'opacity', 0, 250, 'ease-out')
}

function computeTransformProp() {
  return 'transform' in document.body.style ?
    'transform' : 'webkitTransform' in document.body.style ?
    'webkitTransform' : 'mozTransform' in document.body.style ?
    'mozTransform' : 'oTransform' in document.body.style ?
    'oTransform' : 'msTransform'
}

export function findParentBySelector(el: HTMLElement, selector: string): HTMLElement {
  return el.closest(selector) || el
}

export function viewportDim(): ViewportDim {
  if (cachedViewportDim) return cachedViewportDim

  const e = document.documentElement
  const vpd = cachedViewportDim = {
    vw: e.clientWidth,
    vh: e.clientHeight
  }
  return vpd
}

export const viewSlideIn = onPageEnter(pageSlideIn)
export const viewFadeIn = onPageEnter(elFadeIn)

export const viewFadeOut = onPageLeave(elFadeOut)

export function transformProp(): string {
  if (!cachedTransformProp) cachedTransformProp = computeTransformProp()
  return cachedTransformProp
}

export function clearCachedViewportDim(): void {
  cachedViewportDim = null
  cachedIsPortrait = undefined
}

export function slidesInUp(vnode: Mithril.VnodeDOM<any, any>): Promise<void> {
  const el = (vnode.dom as HTMLElement)
  el.style.transform = 'translateY(100%)'
  // force reflow hack
  vnode.state.lol = el.offsetHeight
  return Zanimo(el, 'transform', 'translateY(0)', 250, 'ease-out')
  .catch(console.log.bind(console))
}

export function slidesOutDown(callback: (fromBB?: string) => void, elID: string): () => void {
  return function(fromBB?: string) {
    const el = document.getElementById(elID)
    if (el) {
      Zanimo(el, 'transform', 'translateY(100%)', 250, 'ease-out')
      .then(() => utils.autoredraw(() => callback(fromBB)))
      .catch(console.log.bind(console))
    }
  }
}

export function slidesOutRight(callback: (fromBB?: string) => void, elID: string): () => void {
  return function(fromBB?: string) {
    const el = document.getElementById(elID)
    if (el) {
      Zanimo(el, 'transform', 'translateX(100%)', 250, 'ease-out')
      .then(() => utils.autoredraw(() => callback(fromBB)))
      .catch(console.log.bind(console))
    }
  }
}

export function slidesInLeft(vnode: Mithril.VnodeDOM<any, any>): Promise<void> {
  const el = vnode.dom as HTMLElement
  el.style.transform = 'translateX(100%)'
  // force reflow hack
  vnode.state.lol = el.offsetHeight
  return Zanimo(el, 'transform', 'translateX(0)', 250, 'ease-out')
  .catch(console.log.bind(console))
}

export function fadesOut(e: Event, callback: () => void, selector?: string, time = 150) {
  e.stopPropagation()
  const el = selector ? findParentBySelector((e.target as HTMLElement), selector) : (e.target as HTMLElement)
  if (el) {
    Zanimo(el, 'opacity', 0, time)
    .then(() => utils.autoredraw(callback))
    .catch(console.log.bind(console))
  } else {
    callback()
    redraw()
  }
}

type TapHandler = (e: TouchEvent) => void
type RepeatHandler = () => boolean

function createTapHandler(tapHandler: TapHandler, holdHandler?: TapHandler, repeatHandler?: RepeatHandler, scrollX?: boolean, scrollY?: boolean, getElement?: (e: TouchEvent) => HTMLElement | null, preventEndDefault?: boolean) {
  return function(vnode: Mithril.VnodeDOMAny) {
    ButtonHandler(vnode.dom as HTMLElement,
      (e: TouchEvent) => {
        tapHandler(e)
        redraw()
      },
      holdHandler ? (e: TouchEvent) => utils.autoredraw(() => holdHandler(e)) : undefined,
      repeatHandler,
      scrollX,
      scrollY,
      getElement,
      preventEndDefault,
    )
  }
}

export function ontouch(handler: TapHandler) {
  return (vnode: Mithril.VnodeDOMAny) => {
    const dom = vnode.dom as HTMLElement
    dom.addEventListener('touchstart', handler)
  }
}

export function ontap(tapHandler: TapHandler, holdHandler?: TapHandler, repeatHandler?: RepeatHandler, getElement?: (e: TouchEvent) => HTMLElement | null) {
  return createTapHandler(tapHandler, holdHandler, repeatHandler, false, false, getElement)
}

export function ontapX(tapHandler: TapHandler, holdHandler?: TapHandler, getElement?: (e: TouchEvent) => HTMLElement | null) {
  return createTapHandler(tapHandler, holdHandler, undefined, true, false, getElement)
}

export function ontapY(tapHandler: TapHandler, holdHandler?: TapHandler, getElement?: (e: TouchEvent) => HTMLElement | null, preventEndDefault = true) {
  return createTapHandler(tapHandler, holdHandler, undefined, false, true, getElement, preventEndDefault)
}

export function ontapXY(tapHandler: TapHandler, holdHandler?: TapHandler, getElement?: (e: TouchEvent) => HTMLElement | null, preventEndDefault = true) {
  return createTapHandler(tapHandler, holdHandler, undefined, true, true, getElement, preventEndDefault)
}

export function progress(p: number): Mithril.Children {
  if (p === 0) return null
  return h('span', {
    className: 'progress ' + (p > 0 ? 'positive' : 'negative'),
    'data-icon': p > 0 ? 'N' : 'M'
  }, String(Math.abs(p)))
}

export function classSet(classes: {[cl: string]: boolean}): string {
  const arr: string[] = []
  for (const i in classes) {
    if (classes[i]) arr.push(i)
  }
  return arr.join(' ')
}

export function isTablet(): boolean {
  const { vw, vh } = viewportDim()
  return vw >= 768 && vh >= 768
}

export function isPortrait(): boolean {
  if (cachedIsPortrait !== undefined) return cachedIsPortrait
  else {
    cachedIsPortrait = window.matchMedia('(orientation: portrait)').matches
    return cachedIsPortrait
  }
}

let cachedSafeAreaInset: SafeAreaInset | null = null
function nbFromPropValue(p: string): number {
  const f = p.match(/\d{1,3}/)
  const r = f && f[0]
  const n = Number(r)
  return isNaN(n) ? 0 : n
}
function getSafeArea(): SafeAreaInset {
  if (!cachedSafeAreaInset) {
    const s = getComputedStyle(document.documentElement)
    cachedSafeAreaInset = {
      top: nbFromPropValue(s.getPropertyValue('--sat')),
      right: nbFromPropValue(s.getPropertyValue('--sar')),
      bottom: nbFromPropValue(s.getPropertyValue('--sab')),
      left: nbFromPropValue(s.getPropertyValue('--sal')),
    }
    return cachedSafeAreaInset
  }
  return cachedSafeAreaInset
}

function getBoardBounds(viewportDim: ViewportDim, isPortrait: boolean) {
  const { vh, vw } = viewportDim
  const safeArea = getSafeArea()
  const tablet = isTablet()

  if (isPortrait) {
    if (tablet) {
      const side = vw * 0.94
      return {
        width: side,
        height: side
      }
    } else {
      return {
        width: vw,
        height: vw
      }
    }
  } else {
    if (tablet) {
      const wsSide = vh - headerHeight - (vh * 0.06) - safeArea.top
      return {
        width: wsSide,
        height: wsSide
      }
    } else {
      const lSide = vh - headerHeight - safeArea.top
      return {
        width: lSide,
        height: lSide
      }
    }
  }
}

export function hasSpaceForInlineReplay(
  vd: ViewportDim,
  isPortrait: boolean,
): boolean {
  const bounds = getBoardBounds(vd, isPortrait)
  // vh - headerHeight - boardHeight - footerHeight - min size of player tables
  return vd.vh - bounds.height - 56 - 45 - 110 >= 25
}

export function autofocus(vnode: Mithril.VnodeDOM<any, any>): void {
  vnode.dom.focus()
}

export function renderRatingDiff(player: Player | UserGamePlayer): Mithril.Children {
  if (player.ratingDiff === undefined) return null
  if (player.ratingDiff === 0) return h('span.rp.null', ' +0')
  if (player.ratingDiff > 0) return h('span.rp.up', ' +' + player.ratingDiff)
  if (player.ratingDiff < 0) return h('span.rp.down', ' ' + player.ratingDiff)

  return null
}

export function getButton(e: Event): HTMLElement | null {
  const target = (e.target as HTMLElement)
  return target.tagName === 'BUTTON' ? target : target.closest('button')
}

export function getAnchor(e: Event): HTMLElement | null {
  const target = (e.target as HTMLElement)
  return target.tagName === 'A' ? target : target.closest('a')
}

export function getLI(e: Event): HTMLElement | null {
  const target = (e.target as HTMLElement)
  return target.tagName === 'LI' ? target : target.closest('li')
}

export function getTR(e: Event): HTMLElement | null {
  const target = (e.target as HTMLElement)
  return target.tagName === 'TR' ? target : target.closest('tr')
}

export function closest(e: Event, selector: string): HTMLElement | null {
  return (e.target as HTMLElement)?.closest(selector)
}

export function closestHandler(selector: string): (e: Event) => HTMLElement | null {
  return (e: Event) => (e.target as HTMLElement)?.closest(selector)
}
