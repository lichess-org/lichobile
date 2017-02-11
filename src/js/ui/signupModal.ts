import session from '../session';
import * as helper from './helper';
import i18n from '../i18n';
import router from '../router';
import loginModal from './loginModal';
import { closeIcon } from './shared/icons'
import * as h from 'mithril/hyperscript';

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

    return h('div.modal#signupModal', { oncreate: helper.slidesInUp }, [
      h('header', [
        h('button.modal_close', {
          oncreate: helper.ontap(helper.slidesOutDown(close, 'signupModal'))
        }, closeIcon),
        h('h2', i18n('signUp'))
      ]),
      h('div.modal_content', [
        h('p.signupWarning.withIcon[data-icon=!]', [
          i18n('computersAreNotAllowedToPlay')
        ]),
        h('p.tosWarning', [
          'By registering, you agree to be bound by our ',
          h('a', {
            oncreate: helper.ontap(() =>
            window.open('http://lichess.org/terms-of-service', '_blank', 'location=no')
            )},
            'Terms of Service'
          ), '.'
        ]),
        h('form.login', {
          onsubmit: function(e: Event) {
            e.preventDefault();
            return submit((e.target as HTMLElement));
          }
        }, [
          h('input#pseudo[type=text]', {
            placeholder: i18n('username'),
            autocomplete: 'off',
            autocapitalize: 'off',
            autocorrect: 'off',
            spellcheck: false,
            required: true
          }),
          h('input#email[type=email]', {
            placeholder: i18n('email'),
            autocapitalize: 'off',
            autocorrect: 'off',
            spellcheck: false,
            required: true
          }),
          h('input#password[type=password]', {
            placeholder: i18n('password'),
            required: true
          }),
          h('button.fat', i18n('signUp'))
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
  router.backbutton.stack.push(helper.slidesOutDown(close, 'signupModal'));
  isOpen = true;
}

function close(fromBB?: string) {
  window.cordova.plugins.Keyboard.close();
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
  isOpen = false;
}
