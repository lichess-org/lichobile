import socket from '../../../socket';
import redraw from '../../../utils/redraw';
import { handleXhrError } from '../../../utils';
import * as xhr from './../inboxXhr';
import * as helper from '../../helper';
import * as m from 'mithril';
import { ThreadData, ThreadAttrs, ThreadState } from '../interfaces';
import router from '../../../router';

export default function oninit(vnode: Mithril.Vnode<ThreadAttrs>): void {
  helper.analyticsTrackView('Thread');

  socket.createDefault();

  const id = m.prop<string>(vnode.attrs.id);
  const thread = m.prop<ThreadData>();
  const deleteAttempted = m.prop<boolean>(false);

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
    deleteThread
  };
}

function sendResponse(form: HTMLFormElement) {
  const id = (form[0] as HTMLInputElement).value;
  const response = (form[1] as HTMLTextAreaElement).value;
  if(!response || response === '') return;

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
  .then(data => {
      router.set('/inbox/')
  })
  .catch(handleXhrError);
}
