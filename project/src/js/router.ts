import * as Rlite from 'rlite-router';
import * as m from 'mithril';
import * as Vnode from 'mithril/render/vnode';
import { uid } from './utils'
import signals from './signals';

const router = new Rlite();

// unique incremented state id to determine slide direction
let currentStateId: number = 0;
let viewSlideDirection = 'fwd';

export function defineRoutes(mountPoint: Element, routes: {[index: string]: any}) {
  for (let route in routes) {
    const component = routes[route];
    router.add(route, function onRouteMatch({ params }) {

      const RouteComponent = {view() {
        return Vnode(component, null, params, undefined, undefined, undefined);
      }}

      function redraw() {
        m.render(mountPoint, Vnode(RouteComponent, undefined, undefined, undefined, undefined, undefined));
      }

      // TODO it works but would be better in a router exit hook
      signals.redraw.removeAll();
      signals.redraw.add(redraw);
      try {
        // some error may be thrown during on init...
        redraw();
      } catch (e) {
        console.error(e);
        signals.redraw.removeAll();
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

function set(path: string, replace = false) {
  if (replace) {
    window.history.replaceState({ id: currentStateId }, null, '?=' + path);
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
  getViewSlideDirection(): string {
    return viewSlideDirection;
  }
};
