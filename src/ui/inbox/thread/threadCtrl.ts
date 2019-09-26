import redraw from '../../../utils/redraw'
import { handleXhrError } from '../../../utils'
import * as xhr from './../inboxXhr'
import { ThreadData } from '../interfaces'
import router from '../../../router'
import * as stream from 'mithril/stream'

export interface IThreadCtrl {
  id: Mithril.Stream<string>
  thread: Mithril.Stream<ThreadData>
  deleteAttempted: Mithril.Stream<boolean>
  sendResponse: (form: HTMLFormElement) => void
  deleteThread: (id: string) => void
}

export default function ThreadCtrl(threadId: string): IThreadCtrl {
  const id = stream<string>(threadId)
  const thread = stream<ThreadData>()
  const deleteAttempted = stream<boolean>(false)

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
