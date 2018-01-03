import redraw from '../../../utils/redraw'
import { handleXhrError } from '../../../utils'
import * as xhr from './../inboxXhr'
import * as helper from '../../helper'
import { ThreadData } from '../interfaces'
import router from '../../../router'
import * as stream from 'mithril/stream'

export interface IThreadCtrl {
  id: Mithril.Stream<string>
  thread: Mithril.Stream<ThreadData>
  deleteAttempted: Mithril.Stream<boolean>
  sendResponse: (form: HTMLFormElement) => void
  deleteThread: (id: string) => void
  onKeyboardShow(e: Event): void
}

export default function ThreadCtrl(threadId: string): IThreadCtrl {
  const id = stream<string>(threadId)
  const thread = stream<ThreadData>()
  const deleteAttempted = stream<boolean>(false)

  function onKeyboardShow(e: Ionic.KeyboardEvent) {
    helper.onKeyboardShow(e);
    (document.activeElement as HTMLElement).scrollIntoView(true)
  }
  window.addEventListener('native.keyboardshow', onKeyboardShow)
  window.addEventListener('native.keyboardhide', helper.onKeyboardHide)

  xhr.thread(id())
  .then(data => {
    thread(data)
    redraw()
  })
  .catch(handleXhrError)

  return {
    id,
    thread,
    deleteAttempted,
    sendResponse,
    deleteThread,
    onKeyboardShow
  }
}

function sendResponse(form: HTMLFormElement) {
  const id = (form[0] as HTMLInputElement).value
  const response = (form[1] as HTMLTextAreaElement).value
  if (!response) return

  xhr.respond(id, response)
  .then(data => {
    if (data.ok) {
      router.set('/inbox/' + id)
    }
    else {
      redraw()
    }
  })
  .catch(handleXhrError)
}

function deleteThread(id: string) {
  xhr.deleteThread(id)
  .then(() => router.set('/inbox/'))
  .catch(handleXhrError)
}
