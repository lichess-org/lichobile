import socket from '../../socket';
import { handleXhrError } from '../../utils';
import * as xhr from './inboxXhr';
import * as helper from '../helper';
import * as m from 'mithril';
import { InboxData, Thread } from './interfaces';
import compose from './compose';

export default function oninit(vnode: Mithril.Vnode<{}>): void {
  helper.analyticsTrackView('Inbox');

  socket.createDefault();

  const threads = m.prop<Array<Thread>>();
  const composeCtrl = compose.controller();

  xhr.inbox()
  .then(data => {
    console.log(data);
    threads(data);
    return (data);
  })
  .catch(handleXhrError);

  vnode.state = {
    threads,
    composeCtrl
  };
}
