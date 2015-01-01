var session = require('../session');
var utils = require('../utils');
var i18n = require('../i18n');
var formWidgets = require('./_formWidgets');
var settings = require('../settings');

var menu = {};

menu.isOpen = false;
var settingsOpen = false;

function openSettings() {
  settingsOpen = true;
}

function closeSettings() {
  settingsOpen = false;
}

menu.toggle = function() {
  menu.isOpen = !menu.isOpen;
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
    m('h2', i18n('notConnected'))
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
    userobj ? null :
    m('section', [
      m('form#login_form', {
        onsubmit: function(e) {
          e.preventDefault();
          var form = e.target;
          menu.toggle();
          session.login(form[0].value, form[1].value);
        }
      }, [
        m('h3', i18n('signIn')),
        m('input#pseudo[type=text][placeholder=' + i18n('username') + '][autocomplete=off][autocapitalize=off][autocorrect=off]'),
        m('input#password[type=password][placeholder=' + i18n('password') + ']'),
        m('button.login', i18n('signIn'))
      ])
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
        formWidgets.renderCheckbox(i18n('sound'), 'sound', settings.general.sound),
        formWidgets.renderCheckbox(i18n('disableSleepDuringGame'), 'disableSleep', settings.general.disableSleep)
      ])
    ])
  ];
};

module.exports = menu;
