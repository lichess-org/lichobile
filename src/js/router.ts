import * as Rlite from 'rlite-router';
import * as RenderService from 'mithril/render';
import * as Vnode from 'mithril/render/vnode';
import signals from './signals';
import { isFunction } from 'lodash';
import session from './session';
import redraw from './utils/redraw';

interface Backbutton {
  (): void;
  stack: Array<(fromBB?: string) => void>;
}

const uid = (function() {
  let id = 0;
  return () => id++;
})();

const router = new Rlite();

// unique incremented state id to determine slide direction
let currentStateId: number = 0;
let viewSlideDirection = 'fwd';

export function defineRoutes(mountPoint: HTMLElement, routes: {[index: string]: Mithril.Component<any, any>}) {
  for (let route in routes) {
    const component = routes[route];
    router.add(route, function onRouteMatch({ params }) {

      const RouteComponent = {view() {
        return Vnode(component, null, params, undefined, undefined, undefined);
      }}

      function redraw() {
        RenderService.render(mountPoint, Vnode(RouteComponent, undefined, undefined, undefined, undefined, undefined));
      }

      signals.redraw.removeAll();
      signals.redraw.add(redraw);
      // some error may be thrown during component initialization
      // in that case shutdown redraws to avoid multiple execution of oninit
      // hook of buggy component
      try {
        redraw();
      } catch (e) {
        signals.redraw.removeAll();
        throw e;
      }
    });
  }
  window.addEventListener('popstate', processQuerystring);
  processQuerystring();
}

function processQuerystring(e?: PopStateEvent) {
  if (e && e.state) {
    if (e.state.id < currentStateId) {
      viewSlideDirection = 'bwd';
    } else {
      viewSlideDirection = 'fwd';
    }
    currentStateId = e.state.id;
  }
  const qs = window.location.search || '?=';
  const matched = router.run(qs.slice(2));
  if (!matched) router.run('/');
}

function replaceState(path: string) {
  try {
    window.history.replaceState(window.history.state, null, '?=' + path);
  } catch (e) { console.error(e) }
}

const backbutton = (() => {
  interface X {
    (): void;
    stack?: Array<(fromBB?: string) => void>;
  }

  const x: X = () => {
    const b = x.stack.pop();
    if (isFunction(b)) {
      b('backbutton');
      redraw();
    } else if (!/^\/$/.test(get())) {
      // if playing a game as anon ask for confirmation because there is no way
      // back!
      if (/^\/game\/[a-zA-Z0-9]{12}/.test(get()) && !session.isConnected()) {
        navigator.notification.confirm(
          'Do you really want to leave the game? You can\'t go back to it after.',
          i => { if (i === 1) backHistory(); }
        );
      } else {
        backHistory();
      }
    } else {
      window.navigator.app.exitApp();
    }
  };

  x.stack = [];

  return <Backbutton>x;

})();

function set(path: string, replace = false) {
  // reset backbutton stack when changing route
  backbutton.stack = [];
  if (replace) {
    replaceState(path);
  } else {
    const stateId = uid();
    currentStateId = stateId;
    viewSlideDirection = 'fwd';
    try {
      window.history.pushState({ id: stateId }, null, '?=' + path);
    } catch (e) { console.error(e); }
  }
  const matched = router.run(path);
  if (!matched) router.run('/');
}

function get(): string {
  const path = window.location.search || '?=/';
  return decodeURIComponent(path.substring(2));
}

function backHistory(): void {
  if (window.navigator.app && window.navigator.app.backHistory) {
    window.navigator.app.backHistory();
  } else {
    window.history.go(-1);
  }
}

export default {
  get,
  set,
  replaceState,
  backHistory,
  getViewSlideDirection(): string {
    return viewSlideDirection;
  },
  backbutton
};
