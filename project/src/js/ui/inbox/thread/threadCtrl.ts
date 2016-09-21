import socket from '../../../socket';
import { handleXhrError } from '../../../utils';
import * as xhr from './../inboxXhr';
import * as helper from '../../helper';
import * as m from 'mithril';
import { InboxData, Thread } from './../interfaces';

interface ThreadAttrs {
  id: string;
}

export default function oninit(vnode: Mithril.Vnode<ThreadAttrs>): void {
  helper.analyticsTrackView('Inbox');

  socket.createDefault();

  const id: string = vnode.attrs.id;
  const thread = m.prop<Array<Thread>>();

  xhr.thread(id)
  .then(data => {
    console.log(data);
    thread(data);
    return (data);
  })
  .catch(handleXhrError);

  vnode.state = {
    thread
  };
}
