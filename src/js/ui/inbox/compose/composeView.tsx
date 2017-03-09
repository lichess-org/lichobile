import * as helper from '../../helper'
import i18n from '../../../i18n'
import { ComposeState } from '../interfaces'

export function composeBody(ctrl: ComposeState) {
  return (
    <div className="composeWrapper">
      <form id="composeForm"
      onsubmit={function(e: Event) {
        e.preventDefault()
        return ctrl.send(e.target as HTMLFormElement)
      }}>
        {ctrl.id() ? recipientWithName(ctrl) : recipientWithoutName()}
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

function recipientWithName(ctrl: ComposeState) {
  return (
    <input id="recipient" key="recipient" type="text" className="composeInput"
    placeholder={i18n('recipient')}
    autocapitalize="off"
    autocomplete="off"
    value={ctrl.id()}
    />
  )
}

function recipientWithoutName() {
  return (
    <input id="recipient" key="recipient" type="text" className="composeInput"
    placeholder={i18n('recipient')}
    autocapitalize="off"
    autocomplete="off"
    oncreate={helper.autofocus}
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
