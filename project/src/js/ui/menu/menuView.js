var session = require('../../session');
var loginModal = require('../loginModal');
var gamesMenu = require('../gamesMenu');
var i18n = require('../../i18n');
var utils = require('../../utils');
var helper = require('../helper');
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
  ['atomic', 'Atomic']
];

function renderPerf(key, name, perf) {
  return m('div.perf', {
    'data-icon': utils.gameIcon(key)
  }, [
    m('span.name', name),
    m('div.rating', [
      perf.rating,
      helper.progress(perf.prog),
      m('span.nb', '/ ' + perf.games)
    ])
  ]);
}

function perfs(user) {
  var res = perfTypes.map(function(p) {
    var perf = user.perfs[p[0]];
    if (perf) return {
      key: p[0],
      name: p[1],
      perf: perf
    };
  }).sort(function(a, b) {
    return a.perf.games < b.perf.games;
  });
  if (user.perfs.puzzle) res.push({
    key: 'puzzle',
    name: 'Training',
    perf: user.perfs.puzzle
  });

  return res;
}

function openPerfs(user) {
  return perfs(user).map(function(p) {
    return renderPerf(p.key, p.name, p.perf);
  });
}

function closedPerfs(user) {
  return perfs(user).slice(0, 2).map(function(p) {
    return renderPerf(p.key, p.name, p.perf);
  });
}

function renderHeader(user) {
  var header = user ? [
    m('h2', user.username),
    m('section', {
      className: 'ratings ' + (perfsOpen() ? 'open' : 'closed'),
      config: helper.ontouchendScrollY(function() {
        perfsOpen(!perfsOpen());
      })
    }, perfsOpen() ? openPerfs(user) : closedPerfs(user))
  ] : [
    m('h2', 'Anonymous'),
    m('button.login', {
      config: helper.ontouchendScrollY(loginModal.open)
    }, i18n('signIn'))
  ];
  header.unshift(
    m('div.logo', [
      user ? m('button.logout[data-icon=w]', {
        config: helper.ontouchend(session.logout)
      }) : null
    ])
  );

  return header;
}

function renderLinks(user) {
  var links = [
    utils.hasNetwork() ? m('li.side_link', {
      key: 'menu_play_online',
      config: helper.ontouchendScrollY(function() {
        menu.close();
        gamesMenu.openNewGame();
      })
    }, i18n('playOnline')) : null,
    (utils.hasNetwork() && user) ? m('li.side_link', {
      key: 'menu_seeks',
      config: helper.ontouchendScrollY(menu.menuRouteAction('/seeks'))
    }, i18n('correspondence')) : null,
    m('li.side_link', {
      key: 'menu_play_otb',
      config: helper.ontouchendScrollY(menu.menuRouteAction('/otb'))
    }, i18n('playOnTheBoardOffline')),
    m('li.side_link', {
      key: 'menu_play_ai',
      config: helper.ontouchendScrollY(menu.menuRouteAction('/ai'))
    }, i18n('playOfflineComputer')),
    m('li.side_link', {
      key: 'menu_settings',
      config: helper.ontouchendScrollY(menu.menuRouteAction('/settings'))
    }, i18n('settings'))
  ];

  return links;
}

module.exports = function() {
  var user = session.get();
  return m('aside#side_menu', {
    className: menu.isOpen ? 'in' : 'out',
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
