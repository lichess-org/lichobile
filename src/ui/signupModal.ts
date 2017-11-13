import * as h from 'mithril/hyperscript'
import * as debounce from 'lodash/debounce'
import session from '../session'
import redraw from '../utils/redraw'
import { handleXhrError } from '../utils'
import { fetchJSON, ErrorResponse } from '../http'
import i18n from '../i18n'
import router from '../router'
import * as helper from './helper'
import loginModal from './loginModal'
import { closeIcon } from './shared/icons'

interface SubmitErrorResponse extends ErrorResponse {
  body: {
    error: SubmitError
  }
}

interface SubmitError {
  email?: string[]
  username?: string[]
  password?: string[]
}

let isOpen = false
let loading = false
let checkEmail = false

let formError: SubmitError | null = null

export default {
  open,
  close,
  view() {
    if (!isOpen) return null

    return h('div.modal#signupModal', { oncreate: helper.slidesInUp }, [
      h('header', [
        h('button.modal_close', {
          oncreate: helper.ontap(helper.slidesOutDown(close, 'signupModal'))
        }, closeIcon),
        h('h2', i18n('signUp'))
      ]),
      h('div#signupModalContent.modal_content', {
        className: loading ? 'loading' : ''
      }, checkEmail ? renderCheckEmail() : renderForm())
    ])
  }
}

function renderCheckEmail() {
  return [
    h('h1.signup-emailCheck.withIcon[data-icon=E]', i18n('checkYourEmail')),
    h('p', i18n('weHaveSentYouAnEmailClickTheLink')),
    h('p', i18n('ifYouDoNotSeeTheEmailCheckOtherPlaces')),
    h('p', 'Not receiving it? Ask <contact@lichess.org> and we\'ll confirm your email for you. Don\'t forget to mention your username.')
  ]
}

function renderForm() {
  return [
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
        e.preventDefault()
        return submit((e.target as HTMLFormElement))
      }
    }, [
      h('div.field', [
        formError && formError.username ?
          h('div.form-error', formError.username[0]) : null,
        h('input#pseudo[type=text]', {
          className: formError && formError.username ? 'form-error' : '',
          placeholder: i18n('username'),
          autocomplete: 'off',
          autocapitalize: 'off',
          autocorrect: 'off',
          spellcheck: false,
          required: true,
          onfocus: scrollToTop,
          oninput: debounce((e: Event) => {
            const val = (e.target as HTMLFormElement).value.trim()
            if (val && val.length > 2) {
              testUserName(val).then(exists => {
                if (exists) {
                  formError = {
                    username: ['This username is already in use, please try another one.']
                  }
                }
                else {
                  formError = null
                }
                redraw()
              })
            } else {
              formError = null
              redraw()
            }
          }, 100)
        }),
      ]),
      h('div.field', [
        formError && formError.email ?
          h('div.form-error', formError.email[0]) : null,
        h('input#email[type=email]', {
          onfocus: scrollToTop,
          className: formError && formError.email ? 'form-error' : '',
          placeholder: i18n('email'),
          autocapitalize: 'off',
          autocorrect: 'off',
          spellcheck: false,
          required: true
        })
      ]),
      h('div.field', [
        formError && formError.password ?
          h('div.form-error', formError.password[0]) : null,
        h('input#password[type=password]', {
          onfocus: scrollToTop,
          className: formError && formError.password ? 'form-error' : '',
          placeholder: i18n('password'),
          required: true
        })
      ]),
      h('div.submit', [
        h('button.submitButton[data-icon=F]', i18n('signUp'))
      ])
    ])
  ]
}

function scrollToTop(e: Event) {
  setTimeout(() => {
    const el = e.target as HTMLElement
    el.scrollIntoView(true)
  }, 300)
}

function submit(form: HTMLFormElement) {
  const login = form[0].value.trim()
  const email = form[1].value.trim()
  const pass = form[2].value.trim()
  if (!login || !email || !pass) return
  window.cordova.plugins.Keyboard.close()
  loading = true
  formError = null
  redraw()
  session.signup(login, email, pass)
  .then((d: { email_confirm?: boolean }) => {
    if (d && d.email_confirm) {
      // should comfirm email
      loading = false
      checkEmail = true
      redraw()
    } else {
      // user already authenticated
      window.plugins.toast.show(i18n('loginSuccessful'), 'short', 'center')
      loginModal.close()
    }
  })
  .catch((error: any) => {
    if (isSubmitError(error)) {
      loading = false
      formError = error.body.error
      redraw()
    }
    else {
      handleXhrError(error)
    }
  })
}

function isSubmitError(err: any): err is SubmitErrorResponse {
  return (err as SubmitErrorResponse).body.error !== undefined
}

function open() {
  router.backbutton.stack.push(helper.slidesOutDown(close, 'signupModal'))
  formError = null
  isOpen = true
}

function close(fromBB?: string) {
  if (checkEmail === true) loginModal.close()
  window.cordova.plugins.Keyboard.close()
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
  isOpen = false
}

function testUserName(term: string): Promise<boolean> {
  return fetchJSON('/player/autocomplete?exists=1', { query: { term }})
}
