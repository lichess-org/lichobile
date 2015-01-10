var session = require('../session');
var utils = require('../utils');
var i18n = require('../i18n');
var formWidgets = require('./_formWidgets');
var settings = require('../settings');
var Velocity = require('velocity-animate');

var menu = {};

menu.isOpen = false;
var settingsOpen = false;

function openSettings() {
  settingsOpen = true;
}

function closeSettings() {
  settingsOpen = false;
}

// calling m.route performs a full redraw so we need to transition manually
// the side menu between pages
function routeAction(route) {
  return function() {
    menu.close();
    Velocity(document.getElementById('page'), { transform: 'translate3d(0,0,0)' }, {
      complete: function() {
        m.route(route);
      }
    });
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
    m('button', {
      config: utils.ontouchend(function() {
        session.logout();
      })
    }, i18n('logOut'))
  ] : [
    m('h2', i18n('notConnected')),
    m('button', {
      config: utils.ontouchend(routeAction('/login'))
    }, i18n('login'))
  ];
  header.unshift(
    m('div.logo', [
      m('button.settings[data-icon=%]', {
        config: utils.ontouchend(openSettings)
      })
    ])
  );
  return [
    m('header', header),
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
        formWidgets.renderCheckbox(i18n('sound'), 'sound', settings.general.sound),
        formWidgets.renderCheckbox(i18n('disableSleepDuringGame'), 'disableSleep', settings.general.disableSleep)
      ])
    ])
  ];
};

module.exports = menu;
