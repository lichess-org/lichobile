var session = require('../session');
var utils = require('../utils');
var i18n = require('../i18n');
var formWidgets = require('./_formWidgets');
var settings = require('../settings');
var Zanimo = require('zanimo');
var gamesMenu = require('./gamesMenu');

var menu = {};

menu.isOpen = false;
var settingsOpen = false;

function openSettings() {
  settingsOpen = true;
}

function closeSettings() {
  settingsOpen = false;
}

function transitionMenu(thenAction) {
  return Zanimo(document.getElementById('page'), 'transform', 'translate3d(0,0,0)',
    '200', 'ease-out').then(thenAction);
}

function menuAction(route, action) {
  return function() {
    menu.close();
    return transitionMenu(function() {
      m.route(route);
    }).then(action);
  };
}

menu.toggle = function() {
  menu.isOpen = !menu.isOpen;
};

menu.close = function() {
  menu.isOpen = false;
  closeSettings();
};

menu.view = function() {
  var userobj = session.get();
  var header = userobj ? [
    m('h2', userobj.username),
    m('button.refresh[data-icon=P]', {
      config: utils.ontouchend(utils.partial(session.refresh, false))
    }),
    m('button.logout[data-icon=w]', {
      config: utils.ontouchend(session.logout)
    })
  ] : [
    m('h2', i18n('notConnected')),
    m('button.login', {
      config: utils.ontouchend(menuAction('/login'))
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
      class: utils.classSet({
        disabled: nowPlaying.length === 0
      }),
      config: utils.ontouchend(function() {
        if (session.nowPlaying().length) {
          menu.close();
          return transitionMenu(function() {
            m.route('/');
          }).then(function() {
            m.startComputation();
            gamesMenu.openCurrentGames();
            m.endComputation();
          });
        }
      })
    }, [i18n('playingRightNow'), m('span.highlight', ' (' + nowPlaying.length + ')')]),
    m('li.side_link', {
      config: utils.ontouchend(menuAction('/', function() {
        m.startComputation();
        gamesMenu.openNewGame();
        m.endComputation();
      }))
    }, i18n('createAGame'))
  ];
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
        formWidgets.renderCheckbox(i18n('animations'), 'animations', settings.general.animations),
        formWidgets.renderCheckbox(i18n('toggleSound'), 'sound', settings.general.sound),
        formWidgets.renderCheckbox(i18n('disableSleepDuringGame'), 'disableSleep', settings.general.disableSleep)
      ])
    ])
  ];
};

module.exports = menu;
