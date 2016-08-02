import Rlite from 'rlite-router';
import m from 'mithril';
import Node from 'mithril/render/node';
import signals from './signals';

const router = new Rlite();

export function defineRoutes(mountPoint, routes) {
  for (let route in routes) {
    const component = routes[route];
    router.add(route, function({ url, params }) {
      function redraw() {
        // the url key on root component is useful to force mithril to rebuild
        // the component in case of route change with same arg. Otherwise same
        // component is loaded and oninit is not executed.
        // this is a temp (?) workaround to help the migration
        m.render(mountPoint, Node(component, url, params, undefined, undefined, undefined));
      }
      // allow to have a lower level router handler for tv routes where we can't
      // pass component directly
      // FIXME this is a temporary behavior to help migration
      if (typeof component === 'function') {
        component({ url, params });
      } else {
        // just allow sleep by default
        // TODO should be in a router exit handler
        window.plugins.insomnia.allowSleepAgain();
        signals.redraw.removeAll();
        signals.redraw.add(redraw);
        redraw();
      }
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
