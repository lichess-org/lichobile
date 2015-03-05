var session = require('../../session');
var loginModal = require('../loginModal');
var gamesMenu = require('../gamesMenu');
var i18n = require('../../i18n');
var utils = require('../../utils');
var compact = require('lodash-node/modern/arrays/compact');
var iScroll = require('iscroll');

var menu = require('./menu');

var perfsOpen = m.prop(false);

var perfTypes = [
  ['bullet', 'Bullet'],
  ['chess960', 'Chess960'],
  ['blitz', 'Blitz'],
  ['kingOfTheHill', 'King Of The Hill'],
  ['classical', 'Classical'],
  ['threeCheck', 'Three-check'],
  ['correspondence', 'Correspondence'],
  ['antichess', 'Antichess'],
  ['puzzle', 'Training'],
  ['atomic', 'Atomic']
];

function renderPerf(key, name, perf) {
  return m('div.perf', {
    'data-icon': utils.variantIconsMap[key]
  }, [
    m('span.name', name),
    m('div.rating', [
      perf.rating,
      utils.progress(perf.prog),
      m('span.nb', '/ ' + perf.games)
    ])
  ]);
}

function openPerfs(user) {
  return perfTypes.map(function(p) {
    return p ? renderPerf(p[0], p[1], user.perfs[p[0]]) : m('div.perf');
  });
}

function closedPerfs(user) {
  var perfs = compact(Object.keys(user.perfs).map(function(key) {
    var type = perfTypes.filter(function(pt) {
      return pt[0] === key && 'puzzle' !== key;
    })[0];
    if (type) return {
      key: key,
      name: type[1],
      perf: user.perfs[key]
    };
  }));
  return perfs.sort(function(a, b) {
    return a.perf.games < b.perf.games;
  }).slice(0, 2).map(function(p) {
    return renderPerf(p.key, p.name, p.perf);
  });
}

function renderHeader(user) {
  var header = user ? [
    m('h2', user.username),
    m('section', {
      class: 'ratings ' + (perfsOpen() ? 'open' : 'closed'),
      config: utils.ontouchendScrollY(function() {
        perfsOpen(!perfsOpen());
      })
    }, perfsOpen() ? openPerfs(user) : closedPerfs(user))
  ] : [
    m('h2', 'Anonymous'),
    m('button.login', {
      config: utils.ontouchendScrollY(loginModal.open)
    }, i18n('signIn'))
  ];
  header.unshift(
    m('div.logo')
  );

  return header;
}

function renderLinks(user) {
  var links = [
    m('li.side_link', {
      key: 'menu_create_game',
      config: utils.ontouchendScrollY(function() {
        menu.close();
        gamesMenu.openNewGame();
      })
    }, i18n('createAGame')),
    user ? m('li.side_link', {
      key: 'menu_seeks',
      config: utils.ontouchendScrollY(menu.menuRouteAction('/seeks'))
    }, i18n('correspondence')) : null,
    m('li.side_link', {
      key: 'menu_play_otb',
      config: utils.ontouchendScrollY(menu.menuRouteAction('/otb'))
    }, i18n('playOnTheBoardOffline')),
    m('li.side_link', {
      key: 'menu_play_ai',
      config: utils.ontouchendScrollY(menu.menuRouteAction('/ai'))
    }, i18n('playOfflineComputer')),
    m('li.side_link', {
      key: 'menu_settings',
      config: utils.ontouchendScrollY(menu.menuRouteAction('/settings'))
    }, i18n('settings'))
  ];
  if (session.isConnected()) {
    links.push(
      m('li.side_link.logout[data-icon=w]', {
        key: 'menu_logout',
        config: utils.ontouchendScrollY(session.logout)
      }, i18n('logOut'))
    );
  }

  return links;
}

module.exports = function() {
  var user = session.get();
  return m('aside#side_menu', {
    class: menu.isOpen ? 'in' : 'out',
    config: function(el, isUpdate, context) {
      if (!isUpdate) {
        context.scroller = new iScroll(el);
        context.onunload = function() {
          if (context.scroller) {
            context.scroller.destroy();
            context.scroller = null;
          }
        };
      }
      context.scroller.refresh();
    }
  }, m('div.scroller', [
    m('header.side_menu_header', renderHeader(user)),
    m('nav#side_links', m('ul', renderLinks(user)))
  ]));
};
