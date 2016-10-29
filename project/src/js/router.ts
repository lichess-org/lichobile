import * as Rlite from 'rlite-router';
import * as m from 'mithril';
import * as Vnode from 'mithril/render/vnode';
import { uid } from './utils'
import signals from './signals';

const router = new Rlite();

// unique incremented state id to determine slide direction
let currentStateId: number = 0;
let viewSlideDirection = 'fwd';

export function defineRoutes(mountPoint: HTMLElement, routes: {[index: string]: Mithril.BaseComponent}) {
  for (let route in routes) {
    const component = routes[route];
    router.add(route, function onRouteMatch({ params }) {

      const RouteComponent = {view() {
        return Vnode(component, null, params, undefined, undefined, undefined);
      }}

      function redraw() {
        m.render(mountPoint, Vnode(RouteComponent, undefined, undefined, undefined, undefined, undefined));
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
  window.history.replaceState(window.history.state, null, '?=' + path);
}

function set(path: string, replace = false) {
  if (replace) {
    replaceState(path);
  } else {
    const stateId = uid();
    currentStateId = stateId;
    viewSlideDirection = 'fwd';
    window.history.pushState({ id: stateId }, null, '?=' + path);
  }
  const matched = router.run(path);
  if (!matched) router.run('/');
}

function get(): string {
  const path = window.location.search || '?=/';
  return decodeURIComponent(path.substring(2));
}

export default {
  get,
  set,
  replaceState,
  getViewSlideDirection(): string {
    return viewSlideDirection;
  }
};
