import h from 'mithril/hyperscript'
import i18n from '../../../i18n'
import { ErrorResponse } from '../../../http'
import { handleXhrError } from '../../../utils'
import redraw from '../../../utils/redraw'
import session from '../../../session'
import { dropShadowHeader, backButton } from '../../shared/common'
import * as helper from '../../helper'
import layout from '../../layout'

let formError: string | null = null

export default {
  oncreate: helper.viewSlideIn,

  oninit() {
    this.submitting = false
  },

  view() {
    const header = dropShadowHeader(null, backButton(i18n('kidMode')))
    return layout.free(header, renderBody(this))
  }
} as Mithril.Component<Record<string, never>, { submitting: boolean }>

function renderBody(ctrl: { submitting: boolean }) {
  return [
    h('div.native_scroller.page.settings_list', [
      h('p.explanation', i18n('kidModeExplanation')),
      h('p.list_item', h.trust(i18n('inKidModeTheLichessLogoGetsIconX', '<span class="kiddo">😊</span>'))),
      h('p.list_item', [
        h('form.defaultForm.kid_form', {
          onsubmit: (e: Event) => {
            e.preventDefault()

            if (ctrl.submitting) return

            const form = e.target as HTMLFormElement
            const passwd = form['password'].value
            if (!passwd) return

            ctrl.submitting = true
            session.setKidMode(!session.isKidMode(), { passwd })
            .then(() => {
              ctrl.submitting = false
            })
            .catch((err: ErrorResponse) => {
              ctrl.submitting = false
              if (err.status !== 400 && err.status !== 401) handleXhrError(err)
              // TODO update when server side handle content negotiation
              else if (err.status === 400) {
                formError = i18n('incorrectPassword')
                redraw()
              }
            })
          }
        }, [
          h('div.field', [
            h('input#password', {
              type: 'password',
              className: formError ? 'form-error' : '',
              placeholder: i18n('password'),
              required: true
            }),
            formError ? h('div.form-error', formError) : null,
          ]),
          h('div.submit', [
            !session.isKidMode() ?
              h('button.defaultButton', i18n('enableKidMode')) :
              h('button.defaultButton.cancel', i18n('disableKidMode'))
          ])
        ])
      ])
    ])
  ]
}

