var session = require('../../session');
var loginModal = require('../loginModal');
var formWidgets = require('../_formWidgets');
var settings = require('../../settings');
var gamesMenu = require('../gamesMenu');
var i18n = require('../../i18n');
var utils = require('../../utils');
var compact = require('lodash-node/modern/arrays/compact');

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

module.exports = function(onSettingChange) {
  if (menu.settingsOpen) return m('div#settings', [
    m('header', [
      m('button[data-icon=L]', {
        config: utils.ontouchend(menu.closeSettings)
      }),
      m('h2', i18n('settings'))
    ]),
    m('section', [
      formWidgets.renderCheckbox(i18n('pieceAnimation'), 'animations',
        settings.onChange(settings.general.animations, onSettingChange)),
      formWidgets.renderCheckbox(i18n('pieceDestinations'), 'pieceDestinations',
        settings.onChange(settings.general.pieceDestinations, onSettingChange)),
      formWidgets.renderCheckbox(i18n('toggleSound'), 'sound', settings.general.sound),
    ]),
    window.lichess.version ? m('section.app_version', 'v' + window.lichess.version) : null
  ]);
  var user = session.get();
  var header = user ? [
    m('h2', user.username),
    m('section', {
      class: 'ratings ' + (perfsOpen() ? 'open' : 'closed'),
      config: utils.ontouchend(function() {
        perfsOpen(!perfsOpen());
      })
    }, perfsOpen() ? openPerfs(user) : closedPerfs(user))
  ] : [
    m('h2', 'Anonymous'),
    m('button.login', {
      config: utils.ontouchend(loginModal.open)
    }, i18n('signIn'))
  ];
  header.unshift(
    m('div.logo', [
      m('button.settings[data-icon=%]', {
        config: utils.ontouchend(menu.openSettings)
      })
    ])
  );
  var links = [
    m('li.side_link', {
      key: 'menu_create_game',
      config: utils.ontouchend(function() {
        menu.close();
        gamesMenu.openNewGame();
      })
    }, i18n('createAGame')),
    user ? m('li.side_link', {
      key: 'menu_seeks',
      config: utils.ontouchend(menu.menuRouteAction('/seeks'))
    }, i18n('correspondence')) : null,
    m('li.side_link', {
      key: 'menu_play_otb',
      config: utils.ontouchend(menu.menuRouteAction('/otb'))
    }, i18n('playOnTheBoardOffline'))
  ];
  if (session.isConnected()) {
    links.push(
      m('li.side_link.logout[data-icon=w]', {
        key: 'menu_logout',
        config: utils.ontouchend(session.logout)
      }, i18n('logOut'))
    );
  }
  return [
    m('header.side_menu_header', header),
    m('nav#side_links', m('ul', links))
  ];
};
