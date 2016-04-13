import m from 'mithril';

export default {
  init() {
    // open games from external links with url scheme
    window.handleOpenURL = function(url) {
      setTimeout(onUrlOpen.bind(undefined, url), 0);
    };
  }
};

function onUrlOpen(url) {
  const uris = [
    {
      reg: /^lichess:\/\/training\/(\d+)/,
      ctrl: (id) => m.route(`/training/${id}`)
    },
    {
      reg: /^lichess:\/\/analyse\/(\w+)\/?(black|white)?/,
      ctrl: (id, color) => {
        m.route(`/analyse/online/${id}` + (color ? `/${color}` : ''));
      }
    },
    {
      reg: /^lichess:\/\/challenge\/(\w+)/,
      ctrl: (cId) => m.route(`/challenge/${cId}`)
    },
    {
      reg: /^lichess:\/\/(\w+)\/?(black|white)?/,
      ctrl: (gameId, color) => {
        let route = '/game/' + gameId;
        if (color) route += ('/' + color);
        m.route(route);
      }
    }
  ];
  for (var i = 0; i <= uris.length; i++) {
    const r = uris[i];
    const parsed = r.reg.exec(url);
    if (parsed !== null) {
      r.ctrl.apply(null, parsed.slice(1));
      break;
    }
  }
}

