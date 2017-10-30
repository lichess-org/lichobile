import * as h from 'mithril/hyperscript'
import * as Zanimo from 'zanimo'
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

const animDuration = 250

// this must be cached because of the access to document.body.style
let cachedTransformProp: string
let cachedIsPortrait: boolean | undefined
let cachedViewportAspectIs43: boolean
let cachedViewportDim: ViewportDim | null = null

export const headerHeight = 56
export const footerHeight = 45

export function onPageEnter(anim: (el: HTMLElement) => void) {
  return ({ dom }: Mithril.DOMNode) => anim(dom as HTMLElement)
}

// because mithril will call 'onremove' asynchronously when the component has
// an 'onbeforeremove' hook, some cleanup tasks must be done in the latter hook
// thus this helper
export function onPageLeave(anim: (el: HTMLElement) => Promise<void>, cleanup?: () => void) {
  return function({ dom }: Mithril.DOMNode, done: () => void) {
    if (cleanup) cleanup()
    return anim(dom as HTMLElement)
    .then(done)
    .catch(done)
  }
}

// el fade in transition, can be applied to any element
export function elFadeIn(el: HTMLElement, duration = animDuration, origOpacity = '0.5', endOpacity = '1') {
  let tId: number

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
  let tId: number

  function after() {
    clearTimeout(tId)
    if (el) {
      el.removeAttribute('style')
      el.removeEventListener('transitionend', after, false)
    }
  }

  const direction = router.getViewSlideDirection() === 'fwd' ? '100%' : '-100%'
  el.style.transform = `translate3d(${direction},0,0)`
  el.style.transition = `transform ${animDuration}ms ease-out`

  setTimeout(() => {
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

function collectionHas(coll: NodeListOf<Element>, el: HTMLElement): boolean {
  for (let i = 0, len = coll.length; i < len; i++) {
    if (coll[i] === el) return true
  }
  return false
}

export function findParentBySelector(el: HTMLElement, selector: string): HTMLElement {
  const matches = document.querySelectorAll(selector)
  let cur = el as HTMLElement
  while (cur && !collectionHas(matches, cur)) {
    cur = (cur.parentNode as HTMLElement)
  }
  return cur
}

export function viewportDim(): ViewportDim {
  if (cachedViewportDim) return cachedViewportDim

  let e = document.documentElement
  let vpd = cachedViewportDim = {
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

export function slidesInUp(vnode: Mithril.DOMNode): Promise<HTMLElement> {
  const el = (vnode.dom as HTMLElement)
  el.style.transform = 'translateY(100%)'
  // force reflow hack
  vnode.state.lol = el.offsetHeight
  return Zanimo(el, 'transform', 'translateY(0)', 250, 'ease-out')
  .catch(console.log.bind(console))
}

export function slidesOutDown(callback: (fromBB?: string) => void, elID: string): () => Promise<HTMLElement> {
  return function(fromBB?: string) {
    const el = document.getElementById(elID)
    return Zanimo(el, 'transform', 'translateY(100%)', 250, 'ease-out')
    .then(() => utils.autoredraw(() => callback(fromBB)))
    .catch(console.log.bind(console))
  }
}

export function slidesInLeft(vnode: Mithril.DOMNode): Promise<HTMLElement> {
  const el = vnode.dom as HTMLElement
  el.style.transform = 'translateX(100%)'
  // force reflow hack
  vnode.state.lol = el.offsetHeight
  return Zanimo(el, 'transform', 'translateX(0)', 250, 'ease-out')
  .catch(console.log.bind(console))
}

export function slidesOutRight(callback: (fromBB?: string) => void, elID: string): () => Promise<HTMLElement> {
  return function(fromBB?: string) {
    const el = document.getElementById(elID)
    return Zanimo(el, 'transform', 'translateX(100%)', 250, 'ease-out')
    .then(() => utils.autoredraw(() => callback(fromBB)))
    .catch(console.log.bind(console))
  }
}

export function fadesOut(callback: () => void, selector?: string, time = 150): (e: Event) => Promise<HTMLElement> {
  return function(e: Event) {
    e.stopPropagation()
    const el = selector ? findParentBySelector((e.target as HTMLElement), selector) : e.target
    return Zanimo(el, 'opacity', 0, time)
    .then(() => utils.autoredraw(callback))
    .catch(console.log.bind(console))
  }
}

type TapHandler = (e: TouchEvent) => void
type RepeatHandler = () => boolean

function createTapHandler(tapHandler: TapHandler, holdHandler?: TapHandler, repeatHandler?: RepeatHandler, scrollX?: boolean, scrollY?: boolean, getElement?: (e: TouchEvent) => HTMLElement) {
  return function(vnode: Mithril.DOMNode) {
    ButtonHandler(vnode.dom as HTMLElement,
      (e: TouchEvent) => {
        tapHandler(e)
        redraw()
      },
      holdHandler ? (e: TouchEvent) => utils.autoredraw(() => holdHandler(e)) : undefined,
      repeatHandler,
      scrollX,
      scrollY,
      getElement
    )
  }
}

export function ontouch(handler: TapHandler) {
  return ({ dom }: Mithril.DOMNode) => {
    dom.addEventListener('touchstart', handler)
  }
}

export function ontap(tapHandler: TapHandler, holdHandler?: TapHandler, repeatHandler?: RepeatHandler, getElement?: (e: TouchEvent) => HTMLElement) {
  return createTapHandler(tapHandler, holdHandler, repeatHandler, false, false, getElement)
}

export function ontapX(tapHandler: TapHandler, holdHandler?: TapHandler) {
  return createTapHandler(tapHandler, holdHandler, undefined, true, false)
}

export function ontapY(tapHandler: TapHandler, holdHandler?: TapHandler, getElement?: (e: TouchEvent) => HTMLElement) {
  return createTapHandler(tapHandler, holdHandler, undefined, false, true, getElement)
}

export function ontapXY(tapHandler: TapHandler, holdHandler?: TapHandler, getElement?: (e: TouchEvent) => HTMLElement) {
  return createTapHandler(tapHandler, holdHandler, undefined, true, true, getElement)
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
  for (let i in classes) {
    if (classes[i]) arr.push(i)
  }
  return arr.join(' ')
}

export function isWideScreen(): boolean {
  return viewportDim().vw >= 600
}

export function isVeryWideScreen(): boolean {
  return viewportDim().vw >= 960
}

export function is43Aspect(): boolean {
  if (cachedViewportAspectIs43 !== undefined) return cachedViewportAspectIs43
  else {
    cachedViewportAspectIs43 = window.matchMedia('(aspect-ratio: 4/3), (aspect-ratio: 3/4), (device-aspect-ratio: 4/3), (device-aspect-ratio: 3/4)').matches
    return cachedViewportAspectIs43
  }
}

export function isPortrait(): boolean {
  if (cachedIsPortrait !== undefined) return cachedIsPortrait
  else {
    cachedIsPortrait = window.matchMedia('(orientation: portrait)').matches
    return cachedIsPortrait
  }
}

export function getBoardBounds(viewportDim: ViewportDim, isPortrait: boolean, mode: string, halfsize: boolean = false): ClientRect  {
  const { vh, vw } = viewportDim
  const is43 = is43Aspect()

  if (isPortrait) {
    if (halfsize) {
      const side = (vh - headerHeight) / 2
      const pTop = headerHeight
      const margin = (vw - side) / 2
      return {
        top: pTop,
        right: margin,
        bottom: pTop + side,
        left: margin,
        width: side,
        height: side
      }
    }
    else if (is43) {
      const contentHeight = vh - headerHeight
      const side = vw * 0.98
      const pTop = headerHeight + (mode === 'game' ? ((contentHeight - side - footerHeight) / 2) : 0)
      return {
        top: pTop,
        right: vw * 0.01,
        bottom: pTop + side,
        left: vw * 0.01,
        width: side,
        height: side
      }
    } else {
      const contentHeight = vh - headerHeight
      const pTop = headerHeight + (mode === 'game' ? ((contentHeight - vw - footerHeight) / 2) : 0)
      return {
        top: pTop,
        right: vw,
        bottom: pTop + vw,
        left: 0,
        width: vw,
        height: vw
      }
    }
  } else {
    if (is43) {
      const wsSide = vh - headerHeight - (vh * 0.12)
      const wsTop = headerHeight + ((vh - wsSide - headerHeight) / 2)
      return {
        top: wsTop,
        right: wsSide,
        bottom: wsTop + wsSide,
        left: 0,
        width: wsSide,
        height: wsSide
      }
    } else {
      const lSide = vh - headerHeight
      return {
        top: headerHeight,
        right: lSide,
        bottom: headerHeight + lSide,
        left: 0,
        width: lSide,
        height: lSide
      }
    }
  }
}

export function variantReminder(el: HTMLElement, icon: string): void {
  const div = document.createElement('div')
  div.className = 'variant_reminder'
  div.dataset['icon'] = icon
  el.appendChild(div)
  setTimeout(function() {
    const r = el.querySelector('.variant_reminder')
    if (r) {
      r.classList.add('gone')
      setTimeout(function() {
        if (el && r) el.removeChild(r)
      }, 600)
    }
  }, 800)
}

export function autofocus(vnode: Mithril.DOMNode): void {
  (vnode.dom as HTMLElement).focus()
}

let contentHeight: number
export function onKeyboardShow(e: Ionic.KeyboardEvent): void {
  if (window.cordova.platformId === 'ios') {
    const content = document.getElementById('free_content')
    if (content) {
      contentHeight = content.offsetHeight
      content.style.height = (contentHeight - e.keyboardHeight) + 'px'
    }
  }
}

export function onKeyboardHide(): void {
  if (window.cordova.platformId === 'ios') {
    const content = document.getElementById('free_content')
    if (content) content.style.height = contentHeight + 'px'
  }
}

export function renderRatingDiff(player: Player | UserGamePlayer): Mithril.Children {
  if (player.ratingDiff === undefined) return null
  if (player.ratingDiff === 0) return h('span.rp.null', ' +0')
  if (player.ratingDiff > 0) return h('span.rp.up', ' +' + player.ratingDiff)
  if (player.ratingDiff < 0) return h('span.rp.down', ' ' + player.ratingDiff)

  return null
}

export function getButton(e: Event): HTMLElement {
  const target = (e.target as HTMLElement)
  return target.tagName === 'BUTTON' ? target : findParentBySelector(target, 'button')
}

export function getLI(e: Event) {
  const target = (e.target as HTMLElement)
  return target.tagName === 'LI' ? target : findParentBySelector(target, 'li')
}

export function getTR(e: Event) {
  const target = (e.target as HTMLElement)
  return target.tagName === 'TR' ? target : findParentBySelector(target, 'tr')
}

export function findElByClassName(e: Event, className: string) {
  const target = (e.target as HTMLElement)
  return target.classList.contains(className) ?
    target : findParentBySelector(target, '.' + className)
}

