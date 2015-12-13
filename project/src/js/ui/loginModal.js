import session from '../session';
import push from '../push';
import * as utils from '../utils';
import helper from './helper';
import i18n from '../i18n';
import signupModal from './signupModal';
import backbutton from '../backbutton';
import m from 'mithril';

var loginModal = {};

var isOpen = false;

var submit = function(form) {
  var login = form[0].value.trim();
  var pass = form[1].value.trim();
  if (!login || !pass) return false;
  window.cordova.plugins.Keyboard.close();
  session.login(form[0].value.trim(), form[1].value.trim()).then(function() {
    loginModal.close();
    window.plugins.toast.show(i18n('loginSuccessful'), 'short', 'center');
    push.register();
  }, function(err) {
    utils.handleXhrError(err);
  });
};

loginModal.open = function() {
  helper.analyticsTrackView('Login');
  backbutton.stack.push(loginModal.close);
  isOpen = true;
};

loginModal.close = function(fromBB) {
  window.cordova.plugins.Keyboard.close();
  if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
  isOpen = false;
};

loginModal.view = function() {
  if (!isOpen) return m('div#login.modal.modal_slide');

  return m('div#login.modal.modal_slide.show', [
    m('header', [
      m('button.modal_close[data-icon=L]', {
        config: helper.ontouch(loginModal.close)
      }),
      m('h2', i18n('signIn'))
    ]),
    m('div.modal_content', [
      m('form', {
        onsubmit: function(e) {
          e.preventDefault();
          return submit(e.target);
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
        m('button.fat', i18n('signIn'))
      ]),
      m('div.signup', [
        m('a', {
          config: helper.ontouch(signupModal.open)
        }, [i18n('newToLichess'), ' ', i18n('signUp')])
      ])
    ])
  ]);
};

module.exports = loginModal;
