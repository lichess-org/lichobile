import session from '../session';
import * as helper from './helper';
import i18n from '../i18n';
import backbutton from '../backbutton';
import loginModal from './loginModal';
import * as m from 'mithril';

interface SubmitError {
  error: {
    username?: string[]
    password?: string[]
  }
}

let isOpen = false;

export default {
  open,
  close,
  view() {
    if (!isOpen) return null;

    return m('div.modal#signupModal', { oncreate: helper.slidesInUp }, [
      m('header', [
        m('button.modal_close[data-icon=L]', {
          oncreate: helper.ontap(helper.slidesOutDown(close, 'signupModal'))
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
            oncreate: helper.ontap(() =>
            window.open('http://lichess.org/terms-of-service', '_blank', 'location=no')
            )},
            'Terms of Service'
          ), '.'
        ]),
        m('form.login', {
          onsubmit: function(e: Event) {
            e.preventDefault();
            return submit((e.target as HTMLElement));
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
  }
}

function submit(form: HTMLElement) {
  const login = form[0].value.trim();
  const email = form[1].value.trim();
  const pass = form[2].value.trim();
  if (!login || !email || !pass) return;
  window.cordova.plugins.Keyboard.close();
  session.signup(login, email, pass).then(() => {
    close();
    loginModal.close();
    window.plugins.toast.show(i18n('loginSuccessful'), 'short', 'center');
  })
  .catch(error => {
    if (error.response) {
      error.response.json().then((data: SubmitError) => {
        if (data.error.username)
          window.plugins.toast.show(data.error.username[0], 'short', 'center');
        else if (data.error.password)
          window.plugins.toast.show(data.error.password[0], 'short', 'center');
      });
    }
  });
}

function open() {
  backbutton.stack.push(helper.slidesOutDown(close, 'signupModal'));
  isOpen = true;
}

function close(fromBB?: string) {
  window.cordova.plugins.Keyboard.close();
  if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
  isOpen = false;
}
