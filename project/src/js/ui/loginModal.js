var session = require('../session');
var utils = require('../utils');
var i18n = require('../i18n');

var loginModal = {};

var isOpen = false;

loginModal.open = function() {
  isOpen = true;
};

loginModal.close = function() {
  window.cordova.plugins.Keyboard.close();
  isOpen = false;
};

loginModal.view = function() {
  if (!isOpen) return;
  return m('div#login.modal', [
    m('header', [
      m('button.modal_close[data-icon=L]', {
        config: utils.ontouchend(loginModal.close)
      }),
      m('h2', i18n('signIn'))
    ]),
    m('div.modal_content', [
      m('form#login_form', {
        onsubmit: function(e) {
          e.preventDefault();
          var form = e.target;
          var login = form[0].value.trim();
          var pass = form[1].value.trim();
          if (!login || !pass) return false;
          window.cordova.plugins.Keyboard.close();
          session.login(form[0].value.trim(), form[1].value.trim()).then(function() {
            loginModal.close();
            window.plugins.toast.show(i18n('loginSuccessfull'), 'short', 'center');
          }, function(err) {
            utils.handleXhrError(err);
          });
        }
      }, [
        m('input#pseudo[type=text]', {
          placeholder: i18n('username'),
          autocomplete: 'off',
          autocapitalize: 'off',
          autocorrect: 'off',
          spellcheck: false,
          required: true
        }),
        m('input#password[type=password]', {
          placeholder: i18n('password'),
          required: true
        }),
        m('button.login', i18n('signIn'))
      ])
    ])
  ]);
};

module.exports = loginModal;
