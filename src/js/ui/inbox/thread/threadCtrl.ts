import socket from '../../../socket'
import redraw from '../../../utils/redraw'
import { handleXhrError } from '../../../utils'
import * as xhr from './../inboxXhr'
import * as helper from '../../helper'
import { ThreadData, ThreadAttrs, ThreadState } from '../interfaces'
import router from '../../../router'
import * as stream from 'mithril/stream'

export default function oninit(vnode: Mithril.Vnode<ThreadAttrs, ThreadState>): void {
  socket.createDefault()

  const id = stream<string>(vnode.attrs.id)
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

  vnode.state = <ThreadState> {
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
