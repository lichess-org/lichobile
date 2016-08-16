import Rlite from 'rlite-router';
import m from 'mithril';
import Node from 'mithril/render/node';
import signals from './signals';

const router = new Rlite();

// this counter is passed to the root component as key to force mithril to
// trash current view and re-render on route change
let routeCounter = 0;

export function defineRoutes(mountPoint, routes) {
  for (let route in routes) {
    const component = routes[route];
    router.add(route, function({ url, params }) {
      function redraw() {
        m.render(mountPoint, Node(component, routeCounter, params, undefined, undefined, undefined));
      }
      // allow to have a lower level router handler for tv routes where we can't
      // pass component directly
      if (typeof component === 'function') {
        component({ url, params });
      } else {
        // just allow sleep by default
        // TODO should be in a router exit handler
        signals.redraw.removeAll();
        signals.redraw.add(redraw);
        redraw();
      }

      routeCounter++;
    });
  }
  window.addEventListener('popstate', processQuerystring);
  processQuerystring();
}

function processQuerystring() {
  const qs = window.location.search || '?=';
  const matched = router.run(qs.slice(2));
  if (!matched) router.run('/');
}


export default {
  set(path, replace) {
    if (replace) {
      window.history.replaceState(null, null, '?=' + path);
    } else {
      window.history.pushState(null, null, '?=' + path);
    }
    const matched = router.run(path);
    if (!matched) router.run('/');
  },
  get() {
    return window.location.search || '?=';
  }
};
