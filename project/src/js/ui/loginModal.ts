import session from '../session';
import redraw from '../utils/redraw';
import socket from '../socket';
import signals from '../signals';
import push from '../push';
import challengesApi from '../lichess/challenges';
import * as utils from '../utils';
import * as helper from './helper';
import i18n from '../i18n';
import signupModal from './signupModal';
import backbutton from '../backbutton';
import * as m from 'mithril';

let isOpen = false;

export default {
  open,
  close,
  view() {
    if (!isOpen) return null;

    return m('div.modal#loginModal', { oncreate: helper.slidesInUp }, [
      m('header', [
        m('button.modal_close[data-icon=L]', {
          oncreate: helper.ontap(helper.slidesOutDown(close, 'loginModal'))
        }),
        m('h2', i18n('signIn'))
      ]),
      m('div.modal_content', [
        m('form.login', {
          onsubmit: (e: Event) => {
            e.preventDefault();
            submit((e.target as HTMLElement));
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
            oncreate: helper.ontap(signupModal.open)
          }, [i18n('newToLichess'), ' ', i18n('signUp')])
        ])
      ])
    ]);
  }
}

function submit(form: HTMLElement) {
  const login = form[0].value.trim();
  const pass = form[1].value;
  if (!login || !pass) return;
  window.cordova.plugins.Keyboard.close();
  session.login(login, pass)
  .then(() => {
    close();
    window.plugins.toast.show(i18n('loginSuccessful'), 'short', 'center');
    signals.afterLogin.dispatch();
    redraw();
    // reconnect socket to refresh friends...
    socket.connect();
    push.register();
    challengesApi.refresh();
    session.refresh();
  })
  .catch(err => {
    if (err.ipban) {
      close();
    }
    throw err;
  })
  .catch(utils.handleXhrError);
}

function open() {
  console.log(isOpen)
  backbutton.stack.push(helper.slidesOutDown(close, 'loginModal'));
  isOpen = true;
}

function close(fromBB?: string) {
  window.cordova.plugins.Keyboard.close();
  if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
  isOpen = false;
}
