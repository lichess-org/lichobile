var session = require('../session');
var utils = require('../utils');
var i18n = require('../i18n');
var formWidgets = require('./_formWidgets');
var settings = require('../settings');
var Zanimo = require('zanimo');
var gamesMenu = require('./gamesMenu');
var loginModal = require('./loginModal');

var menu = {};

menu.isOpen = false;
var settingsOpen = false;

function openSettings() {
  settingsOpen = true;
}

function closeSettings() {
  settingsOpen = false;
}

// we need to transition manually the menu on route change, because mithril's
// diff strategy is 'all'
function menuRouteAction(route) {
  return function() {
    menu.close();
    return Zanimo(document.getElementById('page'), 'transform', 'translate3d(0,0,0)',
      '200', 'ease-out').then(utils.ƒ(m.route, route));
  };
}

menu.toggle = function() {
  menu.isOpen = !menu.isOpen;
};

menu.close = function() {
  menu.isOpen = false;
  closeSettings();
};

var perfs = [
  ['bullet', 'Bullet'],
  ['chess960', 'Chess960'],
  ['blitz', 'Blitz'],
  ['kingOfTheHill', 'King Of The Hill'],
  ['classical', 'Classical'],
  ['threeCheck', 'Three-check'],
  ['correspondence', 'Correspondence'],
  ['antichess', 'Antichess'],
  null,
  ['atomic', 'Atomic']
];

menu.view = function() {
  if (!menu.isOpen) return;
  var user = session.get();
  var header = user ? [
    m('h2', user.username),
    m('section.ratings', perfs.map(function(p) {
      if (!p) return m('div.perf');
      var k = p[0];
      var name = p[1];
      var perf = user.perfs[k];
      return m('div.perf', {
          'data-icon': utils.variantIconsMap[k]
      }, [
        m('span.name', name),
        m('span.rating', [
          perf.rating,
          utils.progress(perf.prog),
          m('span.nb', '/ ' + perf.games)
        ])
      ]);
    }))
  ] : [
    m('h2', i18n('notConnected')),
    m('button.login', {
      config: utils.ontouchend(loginModal.open)
    }, i18n('login'))
  ];
  header.unshift(
    m('div.logo', [
      m('button.settings[data-icon=%]', {
        config: utils.ontouchend(openSettings)
      })
    ])
  );
  var nowPlaying = session.nowPlaying();
  var links = [
    m('li.side_link', {
      config: utils.ontouchend(function() {
        menu.close();
        gamesMenu.openNewGame();
      })
    }, i18n('createAGame'))
  ];
  if (session.isConnected()) {
    links.unshift(
      m('li.side_link', {
        class: utils.classSet({
          disabled: nowPlaying.length === 0
        }),
        config: utils.ontouchend(function() {
          if (session.nowPlaying().length) {
            menu.close();
            gamesMenu.openCurrentGames();
          }
        })
      }, [i18n('playingRightNow'), m('span.highlight', ' (' + nowPlaying.length + ')')])
    );
    links.push(
      m('li.side_link.logout[data-icon=w]', {
        config: utils.ontouchend(session.logout)
      }, i18n('logOut'))
    );
  }
  return [
    m('header.side_menu_header', header),
    m('nav#side_links', [
      m('ul', links)
    ]),
    m('div#settings', {
      class: utils.classSet({
        show: settingsOpen
      })
    }, [
      m('header', [
        m('button[data-icon=L]', {
          config: utils.ontouchend(closeSettings)
        }),
        m('h2', i18n('settings'))
      ]),
      m('section', [
        formWidgets.renderCheckbox(i18n('pieceAnimation'), 'animations', settings.general.animations),
        formWidgets.renderCheckbox(i18n('pieceDestinations'), 'pieceDestinations', settings.general.pieceDestinations),
        formWidgets.renderCheckbox(i18n('toggleSound'), 'sound', settings.general.sound),
      ]),
      m('section.app_version', window.lichess.version)
    ])
  ];
};

module.exports = menu;
