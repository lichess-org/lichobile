import session from '../session';
import helper from './helper';
import i18n from '../i18n';
import backbutton from '../backbutton';
import loginModal from './loginModal';
import m from 'mithril';

const signupModal = {};

var isOpen = false;

function submit(form) {
  var login = form[0].value.trim();
  var email = form[1].value.trim();
  var pass = form[2].value.trim();
  if (!login || !email || !pass) return false;
  window.cordova.plugins.Keyboard.close();
  return session.signup(login, email, pass).then(function() {
    signupModal.close();
    loginModal.close();
    window.plugins.toast.show(i18n('loginSuccessful'), 'short', 'center');
  }, function(error) {
    var data = error.response;
    if (data.error.username)
      window.plugins.toast.show(data.error.username[0], 'short', 'center');
    else if (data.error.password)
      window.plugins.toast.show(data.error.password[0], 'short', 'center');
  });
}

signupModal.open = function() {
  backbutton.stack.push(helper.slidesOutDown(signupModal.close, 'signupModal'));
  isOpen = true;
};

signupModal.close = function(fromBB) {
  window.cordova.plugins.Keyboard.close();
  if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
  isOpen = false;
};

signupModal.view = function() {
  if (!isOpen) return null;

  return m('div.modal#signupModal', { config: helper.slidesInUp }, [
    m('header', [
      m('button.modal_close[data-icon=L]', {
        config: helper.ontouch(helper.slidesOutDown(signupModal.close, 'signupModal'))
      }),
      m('h2', i18n('signUp'))
    ]),
    m('div.modal_content', [
      m('p.signupWarning.withIcon[data-icon=!]', [
        i18n('computersAreNotAllowedToPlay')
      ]),
      m('p.tosWarning', [
        'By registering, you agree to be bound by our ',
        m('a', {
          config: helper.ontouch(() =>
          window.open('http://lichess.org/terms-of-service', '_blank', 'location=no')
          )},
          'Terms of Service'
        ), '.'
      ]),
      m('form.login', {
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
        m('input#email[type=email]', {
          placeholder: i18n('email'),
          autocapitalize: 'off',
          autocorrect: 'off',
          spellcheck: false,
          required: true
        }),
        m('input#password[type=password]', {
          placeholder: i18n('password'),
          required: true
        }),
        m('button.fat', i18n('signUp'))
      ])
    ])
  ]);
};

export default signupModal;
