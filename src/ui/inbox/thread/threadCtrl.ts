import redraw from '../../../utils/redraw'
import { handleXhrError, prop, Prop } from '../../../utils'
import * as xhr from './../inboxXhr'
import { ThreadData } from '../interfaces'
import router from '../../../router'

export interface IThreadCtrl {
  id: Prop<string>
  thread: Prop<ThreadData | null>
  deleteAttempted: Prop<boolean>
  sendResponse: (form: HTMLFormElement) => void
  deleteThread: (id: string) => void
}

export default function ThreadCtrl(threadId: string): IThreadCtrl {
  const id = prop<string>(threadId)
  const thread = prop<ThreadData | null>(null)
  const deleteAttempted = prop<boolean>(false)

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
