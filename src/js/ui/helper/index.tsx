import * as Zanimo from 'zanimo';
import redraw from '../../utils/redraw';
import router from '../../router';
import settings from '../../settings';
import * as utils from '../../utils';
import ButtonHandler from './button';
import * as h from 'mithril/hyperscript';
import { UserGamePlayer } from '../../lichess/interfaces/user'

export interface ViewportDim {
  vw: number
  vh: number
}

const animDuration = 250;

// this must be cached because of the access to document.body.style
let cachedTransformProp: string
let cachedIsPortrait: boolean
let cachedViewportAspectIs43: boolean
let cachedViewportDim: ViewportDim = null

export function onPageEnter(anim: (el: HTMLElement) => void) {
  return ({ dom }: Mithril.DOMNode) => anim(dom as HTMLElement);
}

// because mithril will call 'onremove' asynchronously when the component has
// an 'onbeforeremove' hook, some cleanup tasks must be done in the latter hook
// thus this helper
export function onPageLeave(anim: (el: HTMLElement) => Promise<void>, cleanup: () => void = null) {
  return function({ dom }: Mithril.DOMNode, done: () => void) {
    if (cleanup) cleanup();
    return anim(dom as HTMLElement)
    .then(done)
    .catch(done);
  };
}

// el fade in transition, can be applied to any element
export function elFadeIn(el: HTMLElement) {
  let tId: number;

  el.style.opacity = '0.5';
  el.style.transition = `opacity ${animDuration}ms ease-out`;

  setTimeout(() => {
    el.style.opacity = '1';
  });

  function after() {
    clearTimeout(tId);
    if (el) {
      el.removeAttribute('style');
      el.removeEventListener('transitionend', after, false);
    }
  }

  el.addEventListener('transitionend', after, false);
  // in case transitionend does not fire
  tId = setTimeout(after, animDuration + 10);
}

// page slide transition
// apply only to page change transitions
// they listen to history to determine if animation is going forward or backward
export function pageSlideIn(el: HTMLElement) {
  let tId: number;

  function after() {
    clearTimeout(tId);
    if (el) {
      el.removeAttribute('style');
      el.removeEventListener('transitionend', after, false);
    }
  }

  const direction = router.getViewSlideDirection() === 'fwd' ? '100%' : '-100%';
  el.style.transform = `translate3d(${direction},0,0)`;
  el.style.transition = `transform ${animDuration}ms ease-out`;

  setTimeout(() => {
    el.style.transform = 'translate3d(0%,0,0)';
  }, 10);

  el.addEventListener('transitionend', after, false);
  // in case transitionend does not fire
  tId = setTimeout(after, animDuration + 20);
}

export function elFadeOut(el: HTMLElement) {
  return Zanimo(el, 'opacity', 0, 250, 'ease-out');
}

function computeTransformProp() {
  return 'transform' in document.body.style ?
    'transform' : 'webkitTransform' in document.body.style ?
    'webkitTransform' : 'mozTransform' in document.body.style ?
    'mozTransform' : 'oTransform' in document.body.style ?
    'oTransform' : 'msTransform';
}

function collectionHas(coll: NodeListOf<Element>, el: HTMLElement) {
  for (let i = 0, len = coll.length; i < len; i++) {
    if (coll[i] === el) return true;
  }
  return false;
}

export function findParentBySelector(el: HTMLElement, selector: string) {
  const matches = document.querySelectorAll(selector);
  let cur = (el.parentNode as HTMLElement);
  while (cur && !collectionHas(matches, cur)) {
    cur = (cur.parentNode as HTMLElement);
  }
  return cur;
}

export function viewportDim(): ViewportDim {
  if (cachedViewportDim) return cachedViewportDim;

  let e = document.documentElement;
  let vpd = cachedViewportDim = {
    vw: e.clientWidth,
    vh: e.clientHeight
  };
  return vpd;
}

export const viewSlideIn = onPageEnter(pageSlideIn);
export const viewFadeIn = onPageEnter(elFadeIn);

export const viewFadeOut = onPageLeave(elFadeOut);

export function transformProp() {
  if (!cachedTransformProp) cachedTransformProp = computeTransformProp();
  return cachedTransformProp;
}

export function clearCachedViewportDim() {
  cachedViewportDim = null
  cachedIsPortrait = undefined
}

export function slidesInUp(vnode: Mithril.DOMNode) {
  const el = (vnode.dom as HTMLElement);
  el.style.transform = 'translateY(100%)';
  // force reflow hack
  vnode.state.lol = el.offsetHeight;
  Zanimo(el, 'transform', 'translateY(0)', 250, 'ease-out')
  .catch(console.log.bind(console));
}

export function slidesOutDown(callback: () => void, elID: string) {
  return function() {
    const el = document.getElementById(elID);
    return Zanimo(el, 'transform', 'translateY(100%)', 250, 'ease-out')
    .then(utils.autoredraw.bind(undefined, callback))
    .catch(console.log.bind(console));
  };
}

export function slidesInLeft(vnode: Mithril.DOMNode) {
  const el = vnode.dom as HTMLElement;
  el.style.transform = 'translateX(100%)';
  // force reflow hack
  vnode.state.lol = el.offsetHeight;
  Zanimo(el, 'transform', 'translateX(0)', 250, 'ease-out')
  .catch(console.log.bind(console));
}

export function slidesOutRight(callback: () => void, elID: string) {
  return function() {
    const el = document.getElementById(elID);
    return Zanimo(el, 'transform', 'translateX(100%)', 250, 'ease-out')
    .then(utils.autoredraw.bind(undefined, callback))
    .catch(console.log.bind(console));
  };
}

export function fadesOut(callback: () => void, selector?: string, time = 150) {
  return function(e: Event) {
    e.stopPropagation();
    const el = selector ? findParentBySelector((e.target as HTMLElement), selector) : e.target;
    return Zanimo(el, 'opacity', 0, time)
    .then(() => utils.autoredraw(callback))
    .catch(console.log.bind(console));
  };
}

type TapHandler = (e?: Event) => void;
type RepeatHandler = () => boolean;

function createTapHandler(tapHandler: TapHandler, holdHandler: TapHandler, repeatHandler: RepeatHandler, scrollX: boolean, scrollY: boolean, touchEndFeedback: boolean, getElement?: (e: TouchEvent) => HTMLElement) {
  return function(vnode: Mithril.DOMNode) {
    ButtonHandler(vnode.dom as HTMLElement,
      (e: Event) => {
        tapHandler(e);
        redraw();
      },
      holdHandler ? () => utils.autoredraw(holdHandler) : null,
      repeatHandler,
      scrollX,
      scrollY,
      touchEndFeedback,
      getElement
    );
  };
}

export function ontouch(handler: TapHandler) {
  return ({ dom }: Mithril.DOMNode) => {
    dom.addEventListener('touchstart', handler);
  };
}

export function ontap(tapHandler: TapHandler, holdHandler?: TapHandler, repeatHandler?: RepeatHandler, touchEndFeedback?: boolean, getElement?: (e: TouchEvent) => HTMLElement) {
  return createTapHandler(tapHandler, holdHandler, repeatHandler, false, false, touchEndFeedback, getElement);
}

export function ontapX(tapHandler: TapHandler, holdHandler?: TapHandler, touchEndFeedback?: boolean) {
  return createTapHandler(tapHandler, holdHandler, null, true, false, touchEndFeedback);
}

export function ontapY(tapHandler: TapHandler, holdHandler?: TapHandler, touchEndFeedback?: boolean, getElement?: (e: TouchEvent) => HTMLElement) {
  return createTapHandler(tapHandler, holdHandler, null, false, true, touchEndFeedback, getElement);
}

export function progress(p: number) {
  if (p === 0) return null;
  return h('span', {
    className: 'progress ' + (p > 0 ? 'positive' : 'negative'),
    'data-icon': p > 0 ? 'N' : 'h'
  }, String(Math.abs(p)));
}

export function classSet(classes: {[cl: string]: boolean}) {
  const arr: string[] = [];
  for (let i in classes) {
    if (classes[i]) arr.push(i);
  }
  return arr.join(' ');
}

export function isWideScreen() {
  return viewportDim().vw >= 600;
}

export function isVeryWideScreen() {
  return viewportDim().vw >= 960;
}

export function is43Aspect(): boolean {
  if (cachedViewportAspectIs43 !== undefined) return cachedViewportAspectIs43
  else {
    cachedViewportAspectIs43 = window.matchMedia('(aspect-ratio: 4/3), (aspect-ratio: 3/4), (device-aspect-ratio: 4/3), (device-aspect-ratio: 3/4)').matches;
    return cachedViewportAspectIs43
  }
}

export function isPortrait(): boolean {
  if (cachedIsPortrait !== undefined) return cachedIsPortrait
  else {
    cachedIsPortrait = window.matchMedia('(orientation: portrait)').matches;
    return cachedIsPortrait
  }
}

export function getBoardBounds(viewportDim: ViewportDim, isPortrait: boolean, mode: string, halfsize: boolean = false): BoardBounds  {
  const { vh, vw } = viewportDim;
  const is43 = is43Aspect();
  const headerHeight = 45;

  if (isPortrait) {
    if (halfsize) {
      const side = (vh - headerHeight) / 2;
      const pTop = headerHeight;
      const margin = (vw - side) / 2;
      return {
        top: pTop,
        right: margin,
        bottom: pTop + side,
        left: margin,
        width: side,
        height: side
      };
    }
    else if (is43) {
      const contentHeight = vh - headerHeight;
      const side = vw * 0.98;
      const pTop = headerHeight + (mode === 'game' ? ((contentHeight - side - 45) / 2) : 0);
      return {
        top: pTop,
        right: vw * 0.01,
        bottom: pTop + side,
        left: vw * 0.01,
        width: side,
        height: side
      };
    } else {
      const contentHeight = vh - headerHeight;
      const pTop = headerHeight + (mode === 'game' ? ((contentHeight - vw - 45) / 2) : 0);
      return {
        top: pTop,
        right: vw,
        bottom: pTop + vw,
        left: 0,
        width: vw,
        height: vw
      };
    }
  } else {
    if (is43) {
      const wsSide = vh - headerHeight - (vh * 0.12);
      const wsTop = headerHeight + ((vh - wsSide - headerHeight) / 2);
      return {
        top: wsTop,
        right: wsSide,
        bottom: wsTop + wsSide,
        left: 0,
        width: wsSide,
        height: wsSide
      };
    } else {
      const lSide = vh - headerHeight;
      return {
        top: headerHeight,
        right: lSide,
        bottom: headerHeight + lSide,
        left: 0,
        width: lSide,
        height: lSide
      };
    }
  }
}

export function variantReminder(el: HTMLElement, icon: string): void {
  const div = document.createElement('div');
  div.className = 'variant_reminder';
  div.dataset['icon'] = icon;
  el.appendChild(div);
  setTimeout(function() {
    const r = el.querySelector('.variant_reminder');
    if (r) {
      r.classList.add('gone');
      setTimeout(function() {
        if (el && r) el.removeChild(r);
      }, 600);
    }
  }, 800);
}


// allow user to opt out of track analytics
// only log if setting has it enabled
export function analyticsTrackView(view: string) {
  const enabled = settings.general.analytics();
  if (enabled)
    window.ga.trackView(view);
}

export function analyticsTrackEvent(category: string, action: string) {
  const enabled = settings.general.analytics();
  if (enabled) {
    window.ga.trackEvent(category, action);
  }
}

export function autofocus(vnode: Mithril.DOMNode) {
  (vnode.dom as HTMLElement).focus();
}

let contentHeight: number;
export function onKeyboardShow(e: Ionic.KeyboardEvent) {
  if (window.cordova.platformId === 'ios') {
    const content = document.getElementById('free_content');
    if (content) {
      contentHeight = content.offsetHeight;
      content.style.height = (contentHeight - e.keyboardHeight) + 'px';
    }
  }
}

export function onKeyboardHide() {
  if (window.cordova.platformId === 'ios') {
    const content = document.getElementById('free_content');
    if (content) content.style.height = contentHeight + 'px';
  }
}

export function renderRatingDiff(player: Player | UserGamePlayer) {
  if (player.ratingDiff === undefined) return null;
  if (player.ratingDiff === 0) return <span className="rp null"> +0</span>;
  if (player.ratingDiff > 0) return <span className="rp up"> + {player.ratingDiff}</span>;
  if (player.ratingDiff < 0) return <span className="rp down"> {player.ratingDiff}</span>;

  return null;
}
