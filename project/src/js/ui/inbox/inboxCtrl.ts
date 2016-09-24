import socket from '../../socket';
import redraw from '../../utils/redraw';
import { handleXhrError } from '../../utils';
import * as xhr from './inboxXhr';
import * as helper from '../helper';
import * as m from 'mithril';
import { InboxData, Thread } from './interfaces';

export default function oninit(vnode: Mithril.Vnode<{}>): void {
  helper.analyticsTrackView('Inbox');

  socket.createDefault();

  const threads = m.prop<Array<Thread>>();

  xhr.inbox()
  .then(data => {
    console.log(data);
    threads(data);
    redraw();
  })
  .catch(handleXhrError);

  vnode.state = {
    threads
  };
}
