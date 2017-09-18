import * as helper from '../../helper'
import i18n from '../../../i18n'
import redraw from '../../../utils/redraw'

import { IComposeCtrl } from './ComposeCtrl'

export function composeBody(ctrl: IComposeCtrl) {
  return (
    <div className="composeWrapper">
      <form id="composeForm"
      onsubmit={(e: Event) => {
        e.preventDefault()
        return ctrl.send(e.target as HTMLFormElement)
      }}>
        {ctrl.id() ? recipientWithName(ctrl) : recipientWithoutName(ctrl)}
        {ctrl.autocompleteResults().length ?
          <ul className="compose_autocompleteResults native_scroller">
            {ctrl.autocompleteResults().map(u => {
              return (
                <li className="list_item nav" key={u} oncreate={helper.ontapY(() => recipientSelected(u, ctrl))}>
                {u}
                </li>
              )
            })}
          </ul> : null
        }
        {(ctrl.errors() && ctrl.errors().username) ? renderError('recipientError', ctrl.errors().username[0]) : null}

        <input id="subject" key="subject" type="text" className="composeInput"
        placeholder={i18n('subject')}
        oncreate={ctrl.id() ? helper.autofocus : null}
        />
        {(ctrl.errors() && ctrl.errors().subject) ? renderError('subjectError', ctrl.errors().subject[0]) : null}

        <textarea id="body" key="body" className="composeInput composeTextarea" />
        {(ctrl.errors() && ctrl.errors().text) ? renderError('textError', ctrl.errors().text[0]) : null}
        <button key="send" className="fatButton composeSend" type="submit">
          <span className="fa fa-check" />
          {i18n('send')}
        </button>
      </form>
    </div>
  )
}

function recipientWithName(ctrl: IComposeCtrl) {
  return (
    <input id="recipient" key="recipient" type="text" className="composeInput"
      placeholder={i18n('recipient')}
      autocapitalize="off"
      autocomplete="off"
      value={ctrl.id()}
      oninput={ctrl.onInput}
      onblur={() => {
        ctrl.autocompleteResults([])
        redraw()
      }}
    />
  )
}

function recipientWithoutName(ctrl: IComposeCtrl) {
  return (
    <input id="recipient" key="recipient" type="text" className="composeInput"
      placeholder={i18n('recipient')}
      autocapitalize="off"
      autocomplete="off"
      oncreate={helper.autofocus}
      oninput={ctrl.onInput}
      onblur={() => {
        ctrl.autocompleteResults([])
        redraw()
      }}
    />
  )
}

function renderError(divKey: string, errorMessage: string) {
  return (
    <div key={divKey} className="errorMessage">
      {errorMessage}
    </div>
  )
}

function recipientSelected(user: string, ctrl: IComposeCtrl) {
  ctrl.autocompleteResults([])
  const recipient = document.getElementById('recipient')
  const subject = document.getElementById('subject')
  if (recipient !== null) (recipient as HTMLFormElement).value = user
  if (subject !== null) subject.focus()
}
