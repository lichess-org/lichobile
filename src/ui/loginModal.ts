import * as h from 'mithril/hyperscript'
import session from '../session'
import { ErrorResponse } from '../http'
import redraw from '../utils/redraw'
import socket from '../socket'
import signals from '../signals'
import push from '../push'
import challengesApi from '../lichess/challenges'
import { handleXhrError } from '../utils'
import * as helper from './helper'
import i18n from '../i18n'
import router from '../router'
import { closeIcon } from './shared/icons'
import signupModal from './signupModal'

let isOpen = false
let formError: string | null = null

export default {
  open,
  close,
  view() {
    if (!isOpen) return null

    return h('div.modal#loginModal', { oncreate: helper.slidesInUp }, [
      h('header', [
        h('button.modal_close', {
          oncreate: helper.ontap(helper.slidesOutDown(close, 'loginModal'))
        }, closeIcon),
        h('h2', i18n('signIn'))
      ]),
      h('div.modal_content', [
        h('form.login', {
          onsubmit: (e: Event) => {
            e.preventDefault()
            submit((e.target as HTMLFormElement))
          }
        }, [
          formError && !isTotpError(formError) ?  h('div.form-error', formError) : null,
          formError === 'InvalidTotpToken' ? h('div.form-error', 'Invalid authentication code') : null,
          h('div.field', [
            h('input#username', {
              type: isTotpError(formError) ? 'hidden' : 'text',
              className: formError ? 'form-error' : '',
              placeholder: i18n('username'),
              autocomplete: 'off',
              autocapitalize: 'off',
              autocorrect: 'off',
              spellcheck: false,
              required: true
            }),
          ]),
          h('div.field', [
            h('input#password', {
              type: isTotpError(formError) ? 'hidden' : 'password',
              className: formError ? 'form-error' : '',
              placeholder: i18n('password'),
              required: true
            }),
          ]),
          isTotpError(formError) ? [
            h('div.field', [
              h('input#token[type=text]', {
                className: formError !== 'MissingTotpToken' ? 'form-error' : '',
                placeholder: 'Authentication code',
                autocomplete: 'off',
                autocapitalize: 'off',
                autocorrect: 'off',
                spellcheck: false,
                pattern: '[0-9]{6}',
                required: true
              }),
            ]),
            h('p.twofactorhelp[data-icon=""]', 'Open the two-factor authentication app on your device to view your authentication code and verify your identity.'),
          ] : null,
          h('div.submit', [
            h('button.submitButton[data-icon=F]', i18n('signIn'))
          ])
        ]),
        h('div.signup', [
          i18n('newToLichess') + ' ',
          h('br'),
          h('a', {
            oncreate: helper.ontap(signupModal.open)
          }, [i18n('signUp')])
        ]),
        h('div.reset', [
          i18n('forgotPassword') + ' ',
          h('br'),
          h('a', {
            oncreate: helper.ontap(() => window.open(`https://lichess.org/password/reset`, '_blank', 'location=no'))
          }, [i18n('passwordReset')])
        ])
      ])
    ])
  }
}

function submit(form: HTMLFormElement) {
  const username = form['username'].value
  const password = form['password'].value
  const token = form['token'] ? form['token'].value : null
  if (!username || !password) return
  redraw()
  window.Keyboard.close()
  session.login(username, password, token)
  .then(() => {
    close()
    window.plugins.toast.show(i18n('loginSuccessful'), 'short', 'center')
    signals.afterLogin.dispatch()
    redraw()
    // reconnect socket to refresh friends...
    socket.connect()
    push.register()
    challengesApi.refresh()
    session.refresh()
  })
  .catch((err: ErrorResponse) => {
    if (err.body.ipban) {
      close()
    } else {
      if (err.status !== 401) handleXhrError(err)
      else {
        if (err.body.global) {
          formError = err.body.global[0]
          redraw()
        }
      }
    }
  })
}

function isTotpError(formError: string | null) {
  return formError === 'MissingTotpToken' || formError === 'InvalidTotpToken'
}

function open() {
  router.backbutton.stack.push(helper.slidesOutDown(close, 'loginModal'))
  isOpen = true
  formError = null
}

function close(fromBB?: string) {
  window.Keyboard.close()
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
  isOpen = false
}
