import { Keyboard } from '@capacitor/keyboard'
import h from 'mithril/hyperscript'
import debounce from 'lodash-es/debounce'
import session, { SignupData, EmailConfirm } from '../session'
import socket from '../socket'
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
      }, checkEmail ? renderCheckEmail() : renderForm())
    ])
  }
}

function renderCheckEmail() {
  return [
    h('h1.signup-emailCheck.withIcon[data-icon=E]', i18n('checkYourEmail')),
    h('p', i18n('weHaveSentYouAnEmailClickTheLink')),
    h('p', i18n('ifYouDoNotSeeTheEmailCheckOtherPlaces')),
    h('p', 'Not receiving it? Visit https://lichess.org/contact to request a manual confirmation.')
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
          window.open('https://lichess.org/terms-of-service', '_blank')
        )},
        'Terms of Service'
      ), '.'
    ]),
    h('form.defaultForm.login', {
      onsubmit: onSignup,
    }, [
      h('div.field', [
        formError && formError.username ?
          h('div.form-error', formError.username[0]) : null,
        h('input#username[type=text]', {
          className: formError && formError.username ? 'form-error' : '',
          onfocus: scrollToTop,
          oninput: debounce(oninput, 500),
          name: 'username',
          'aria-label': 'Username',
          placeholder: i18n('username'),
          autocomplete: 'username',
          autocapitalize: 'off',
          autocorrect: 'off',
          spellcheck: false,
          required: true
        }),
      ]),
      h('div.field', [
        formError && formError.email ?
          h('div.form-error', formError.email[0]) : null,
        h('input#email[type=email]', {
          className: formError && formError.email ? 'form-error' : '',
          onfocus: scrollToTop,
          name: 'email',
          'aria-label': 'Email',
          placeholder: i18n('email'),
          autocomplete: 'email',
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
          className: formError && formError.password ? 'form-error' : '',
          onfocus: scrollToTop,
          name: 'password',
          'aria-label': 'Password',
          placeholder: i18n('password'),
          autocomplete: 'new-password',
          required: true,
          passwordrules: 'minlength: 20; required: lower; required: upper; required: digit; required: [-];'
        })
      ]),
      h('div.submit', [
        h('button.defaultButton[type=submit]', {
          disabled: loading,
          value: 'SIGNUP',
          'aria-label': 'Sign Up',
        }, i18n('signUp'))
      ])
    ])
  ]
}

function oninput(e: Event) {
  const val = (e.target as HTMLFormElement).value.trim()
  if (val && val.match(/^[a-z0-9][\w-]{2,29}$/i)) {
    testUserName(val).then(exists => {
      setUserExistsFeedback(exists)
    })
  } else {
    setUserExistsFeedback(false)
  }
}

function setUserExistsFeedback(exists: boolean) {
  if (exists) {
    formError = {
      username: ['This username is already in use, please try another one.']
    }
  }
  else {
    formError = null
  }
  redraw()
}

function scrollToTop(e: Event) {
  setTimeout(() => {
    const el = e.target as HTMLElement
    el.scrollIntoView(true)
  }, 300)
}

function isConfirmMailData(d: SignupData): d is EmailConfirm {
  return (d as EmailConfirm).email_confirm !== undefined
}

function onSignup(e: Event) {
  e.preventDefault()
  const form: HTMLFormElement = e.target as HTMLFormElement
  const login = (form[0] as HTMLInputElement).value.trim()
  const email = (form[1] as HTMLInputElement).value.trim()
  const pass = (form[2] as HTMLInputElement).value
  if (loading || !login || !email || !pass) return
  Keyboard.hide()
  loading = true
  formError = null
  redraw()
  session.signup(login, email, pass)
  .then(d => {
    loading = false
    if (d && isConfirmMailData(d)) {
      // should comfirm email
      checkEmail = true
      redraw()
    } else {
      socket.reconnectCurrent()
      redraw()
      loginModal.close()
      close()
    }
  })
  .catch((error: any) => {
    loading = false
    if (isSubmitError(error)) {
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
  loading = false
}

function close(fromBB?: string) {
  if (checkEmail === true) loginModal.close()
  Keyboard.hide()
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
  isOpen = false
}

function testUserName(term: string): Promise<boolean> {
  return fetchJSON('/api/player/autocomplete?exists=1', {
    query: { term },
  })
}
