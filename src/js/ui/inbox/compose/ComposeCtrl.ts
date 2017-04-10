import * as throttle from 'lodash/throttle'
import * as helper from '../../helper'
import redraw from '../../../utils/redraw'
import { handleXhrError } from '../../../utils'
import * as xhr from './../inboxXhr'
import { SendErrorResponse, ComposeResponse } from '../interfaces'
import router from '../../../router'
import { FetchError } from '../../../http'
import * as stream from 'mithril/stream'

export interface IComposeCtrl {
  id: Mithril.Stream<string>
  errors: Mithril.Stream<SendErrorResponse>
  send: (form: HTMLFormElement) => void
  onInput: (e: Event) => void
  autocompleteResults: Mithril.Stream<Array<string>>
}

export default function ComposeCtrl(userId: string): IComposeCtrl {

  const id = stream<string>(userId)
  const errors = stream<SendErrorResponse>()
  const autocompleteResults = stream<string[]>([])

  function send(form: HTMLFormElement) {
    const recipient = (form[0] as HTMLInputElement).value
    const subject = (form[1] as HTMLInputElement).value
    const body = (form[2] as HTMLTextAreaElement).value
    xhr.newThread(recipient, subject, body)
    .then((data: ComposeResponse) => {
      if (data.ok) {
        router.set('/inbox/' + data.id)
      }
      else {
        redraw()
      }
    })
    .catch(handleSendError)
  }

  window.addEventListener('native.keyboardhide', helper.onKeyboardHide)
  window.addEventListener('native.keyboardshow', helper.onKeyboardShow)

  function handleSendError (error: FetchError) {
    error.response.json()
    .then((errorResponse: SendErrorResponse) => {
      if (errorResponse && (errorResponse.username || errorResponse.subject || errorResponse.text)) {
        errors(errorResponse)
        redraw()
      }
      else
        throw error
    })
    .catch(handleXhrError)
  }

  return {
    id,
    errors,
    send,
    onInput: throttle((e: Event) => {
      const term = (e.target as HTMLInputElement).value.trim()
      if (term.length >= 3) {
        xhr.autocomplete(term).then(data => {
          autocompleteResults(data)
          redraw()
        })
      }
      else {
        autocompleteResults([])
        redraw()
      }
    }, 250),
    autocompleteResults
  }
}
