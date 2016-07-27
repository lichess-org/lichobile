import Zanimo from 'zanimo';
import settings from '../../settings';
import * as utils from '../../utils';
import ButtonHandler from './button';
import m from 'mithril';

// store temporarily last route to disable animations on same route
// TODO find a better way cause this is ugly
let lastRoute;

// this must be cached because of the access to document.body.style
let cachedTransformProp;
let cachedViewportDim = null;

// view slide transition functions
// they listen to history to determine if animation is going forward or backward
function viewSlideIn(el) {
  if (m.route.get() === lastRoute) {
    return;
  }
  var tId;
  lastRoute = m.route.get();

  function after() {
    clearTimeout(tId);
    utils.setViewSlideDirection('fwd');
    if (el) {
      el.removeAttribute('style');
      el.removeEventListener('transitionend', after, false);
    }
  }

  const direction = utils.getViewSlideDirection() === 'fwd' ? '100%' : '-100%';
  el.style.transform = `translate3d(${direction},0,0)`;
  el.style.transition = 'transform 200ms ease-out';

  setTimeout(() => {
    el.style.transform = 'translate3d(0%,0,0)';
  });

  el.addEventListener('transitionend', after, false);
  // in case transitionend does not fire
  tId = setTimeout(after, 210);
}

function viewSlideOut(el) {
  if (m.route.get() === lastRoute) {
    return;
  }
  var tId;

  function after() {
    clearTimeout(tId);
    utils.setViewSlideDirection('fwd');
  }

  const direction = utils.getViewSlideDirection() === 'fwd' ? '-100%' : '100%';
  el.style.transform = 'translate3d(0%,0,0)';
  el.style.transition = 'transform 200ms ease-out';

  setTimeout(() => {
    el.style.transform = `translate3d(${direction},0,0)`;
  });

  el.addEventListener('transitionend', after, false);
  // in case transitionend does not fire
  tId = setTimeout(after, 210);
}

function viewFadesIn(el) {
  var tId;

  el.style.opacity = '0.5';
  el.style.transition = 'opacity 200ms ease-out';

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
  tId = setTimeout(after, 210);
}

function viewFadesOut(el) {
  var tId;

  el.style.opacity = '1';
  el.style.transition = 'opacity 200ms ease-out, visibility 0s linear 200ms';

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.visibility = 'hidden';
  });

  function after() {
    clearTimeout(tId);
  }

  el.addEventListener('transitionend', after, false);
  // in case transitionend does not fire
  tId = setTimeout(after, 210);
}

function computeTransformProp() {
  return 'transform' in document.body.style ?
    'transform' : 'webkitTransform' in document.body.style ?
    'webkitTransform' : 'mozTransform' in document.body.style ?
    'mozTransform' : 'oTransform' in document.body.style ?
    'oTransform' : 'msTransform';
}

function collectionHas(coll, el) {
  for (var i = 0, len = coll.length; i < len; i++) {
    if (coll[i] === el) return true;
  }
  return false;
}

function findParentBySelector(el, selector) {
  var matches = document.querySelectorAll(selector);
  var cur = el.parentNode;
  while (cur && !collectionHas(matches, cur)) {
    cur = cur.parentNode;
  }
  return cur;
}

function ontouch(tapHandler, holdHandler, repeatHandler, scrollX, scrollY, touchEndFeedback) {
  return function(vnode) {
    ButtonHandler(vnode.dom,
      e => {
        tapHandler(e);
        m.redraw();
      },
      holdHandler ? () => utils.autoredraw(holdHandler) : null,
      repeatHandler,
      scrollX,
      scrollY,
      touchEndFeedback
    );
  };
}

function viewportDim() {
  if (cachedViewportDim) return cachedViewportDim;

  let e = document.documentElement;
  let vpd = cachedViewportDim = {
    vw: e.clientWidth,
    vh: e.clientHeight
  };
  return vpd;
}

export default {
  findParentBySelector,
  slidingPage: c => {
    c.oncreate = vnode => viewSlideIn(vnode.dom);
    c.onremove = vnode => viewSlideOut(vnode.dom);
    return c;
  },
  fadingPage: c => {
    c.oncreate = vnode => viewFadesIn(vnode.dom);
    c.onremove = vnode => viewFadesOut(vnode.dom);
    return c;
  },

  viewportDim,

  transformProp: function() {
    if (!cachedTransformProp) cachedTransformProp = computeTransformProp();
    return cachedTransformProp;
  },

  clearCachedViewportDim() {
    cachedViewportDim = null;
  },

  slidesInUp: function(vnode) {
    const el = vnode.dom;
    el.style.transform = 'translateY(100%)';
    // force reflow hack
    vnode.state.lol = el.offsetHeight;
    Zanimo(el, 'transform', 'translateY(0)', 250, 'ease-out')
    .catch(console.log.bind(console));
  },

  slidesOutDown: function(callback, elID) {
    return function(e) {
      const el = document.getElementById(elID);
      e.redraw = false;
      return Zanimo(el, 'transform', 'translateY(100%)', 250, 'ease-out')
      .then(utils.autoredraw.bind(undefined, callback))
     .catch(console.log.bind(console));
    };
  },

  slidesInLeft: function(vnode) {
    const el = vnode.dom;
    el.style.transform = 'translateX(100%)';
    // force reflow hack
    vnode.state.lol = el.offsetHeight;
    Zanimo(el, 'transform', 'translateX(0)', 250, 'ease-out')
    .catch(console.log.bind(console));
  },

  slidesOutRight: function(callback, elID) {
    return function(e) {
      const el = document.getElementById(elID);
      e.redraw = false;
      return Zanimo(el, 'transform', 'translateX(100%)', 250, 'ease-out')
      .then(utils.autoredraw.bind(undefined, callback))
      .catch(console.log.bind(console));
    };
  },

  fadesOut: function(callback, selector, time = 150) {
    return function(e) {
      e.stopPropagation();
      e.redraw = false;
      var el = selector ? findParentBySelector(e.target, selector) : e.target;
      return Zanimo(el, 'opacity', 0, time)
      .then(() => utils.autoredraw(callback))
      .catch(console.log.bind(console));
    };
  },

  ontouch: function(tapHandler, holdHandler, repeatHandler, touchEndFeedback = true) {
    return ontouch(tapHandler, holdHandler, repeatHandler, false, false, touchEndFeedback);
  },

  ontouchX: function(tapHandler, holdHandler, touchEndFeedback = true) {
    return ontouch(tapHandler, holdHandler, null, true, false, touchEndFeedback);
  },
  ontouchY: function(tapHandler, holdHandler, touchEndFeedback = true) {
    return ontouch(tapHandler, holdHandler, null, false, true, touchEndFeedback);
  },

  progress: function(p) {
    if (p === 0) return null;
    return m('span', {
      className: 'progress ' + (p > 0 ? 'positive' : 'negative'),
      'data-icon': p > 0 ? 'N' : 'M'
    }, Math.abs(p));
  },

  classSet: function(classes) {
    var arr = [];
    for (var i in classes) {
      if (classes[i]) arr.push(i);
    }
    return arr.join(' ');
  },

  isWideScreen: function() {
    return viewportDim().vw >= 600;
  },

  isVeryWideScreen: function() {
    return viewportDim().vw >= 960;
  },

  isIpadLike: function () {
    const { vh, vw } = viewportDim();
    return vh >= 700 && vw <= 1050;
  },

  isPortrait: function() {
    return window.matchMedia('(orientation: portrait)').matches;
  },

  isLandscape: function() {
    return window.matchMedia('(orientation: landscape)').matches;
  },

  isLandscapeSmall: function () {
    const { vh } = viewportDim();
    return vh <= 450;
  },

  // allow user to opt out of track analytics
  // only log if setting has it enabled
  analyticsTrackView: function(view) {
    const enabled = settings.general.analytics();
    if (enabled)
      window.analytics.trackView(view);
  },

  analyticsTrackEvent: function(category, action) {
    const enabled = settings.general.analytics();
    if (enabled) {
      window.analytics.trackEvent(category, action);
    }
  },

  autofocus: function(vnode) {
    vnode.dom.focus();
  },

  renderRatingDiff(player) {
    if (player.ratingDiff === undefined) return null;
    if (player.ratingDiff === 0) return <span className="rp null"> +0</span>;
    if (player.ratingDiff > 0) return <span className="rp up"> + {player.ratingDiff}</span>;
    if (player.ratingDiff < 0) return <span className="rp down"> {player.ratingDiff}</span>;

    return null;
  }
};
