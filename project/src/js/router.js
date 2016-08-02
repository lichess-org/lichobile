import Rlite from 'rlite-router';
import m from 'mithril';
import Node from 'mithril/render/node';
import signals from './signals';

const router = new Rlite();

export function defineRoutes(mountPoint, routes) {
  for (let route in routes) {
    const component = routes[route];
    router.add(route, function({ params }) {
      function redraw() {
        m.render(mountPoint, Node(component, null, params, undefined, undefined, undefined));
      }
      signals.redraw.removeAll();
      signals.redraw.add(redraw);
      redraw();
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
  set(path) {
    window.history.pushState(null, null, '?=' + path);
    const matched = router.run(path);
    if (!matched) router.run('/');
  },
  get() {
    return window.location.search || '?=';
  }
};
