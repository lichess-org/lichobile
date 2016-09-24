import socket from '../../../socket';
import redraw from '../../../utils/redraw';
import { handleXhrError } from '../../../utils';
import * as xhr from './../inboxXhr';
import * as helper from '../../helper';
import * as m from 'mithril';
import { InboxData, Thread } from './../interfaces';
import router from '../../../router';

interface ThreadAttrs {
  id: string;
}

interface InputTag {
  value: string;
}

export default function oninit(vnode: Mithril.Vnode<ThreadAttrs>): void {
  helper.analyticsTrackView('Inbox');

  socket.createDefault();

  const id = m.prop<string>();
  id(vnode.attrs.id);

  vnode.state = {
    id,
    send
  };
}

function send(form: Array<InputTag>) {
  const recipient = form[0].value;
  const subject = form[1].value;
  const body = form[2].value;
  xhr.newThread(recipient, subject, body)
  .then(data => {
    console.log(data);
    if(data.ok) {
      router.set('/inbox/' + data.id)
    }
    else {
      redraw();
    }
  })
  .catch(handleXhrError);
}
