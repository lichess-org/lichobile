import socket from '../../../socket';
import redraw from '../../../utils/redraw';
import { handleXhrError } from '../../../utils';
import * as xhr from './../inboxXhr';
import * as helper from '../../helper';
import * as m from 'mithril';
import { ThreadData, ThreadAttrs, ThreadState } from '../interfaces';
import router from '../../../router';

export default function oninit(vnode: Mithril.Vnode<ThreadAttrs, ThreadState>): void {
  helper.analyticsTrackView('Thread');

  socket.createDefault();

  const id = m.prop<string>(vnode.attrs.id);
  const thread = m.prop<ThreadData>();
  const deleteAttempted = m.prop<boolean>(false);

  function onKeyboardShow(e: Event) {
    helper.onKeyboardShow(e);
    (document.activeElement as HTMLElement).scrollIntoView(true);
  }
  window.addEventListener('native.keyboardshow', onKeyboardShow);
  window.addEventListener('native.keyboardhide', helper.onKeyboardHide);

  xhr.thread(id())
  .then(data => {
    thread(data);
    redraw();
  })
  .catch(handleXhrError);

  vnode.state = <ThreadState> {
    id,
    thread,
    deleteAttempted,
    sendResponse,
    deleteThread,
    onKeyboardShow
  };
}

function sendResponse(form: HTMLFormElement) {
  const id = (form[0] as HTMLInputElement).value;
  const response = (form[1] as HTMLTextAreaElement).value;
  if(!response) return;

  xhr.respond(id, response)
  .then(data => {
    if(data.ok) {
      router.set('/inbox/' + id);
    }
    else {
      redraw();
    }
  })
  .catch(handleXhrError);
}

function deleteThread(id: string) {
  xhr.deleteThread(id)
  .then(() => router.set('/inbox/'))
  .catch(handleXhrError);
}
