import socket from '../../socket';
import { handleXhrError } from '../../utils';
import * as xhr from './inboxXhr';
import * as helper from '../helper';
import * as m from 'mithril';

export default function oninit(vnode) {
  helper.analyticsTrackView('Inbox');

  socket.createDefault();

  xhr.inbox()
  .then(data => {
    console.log(data);
    getPosts(data.messages[0].id);
    return (data);
  })
  .catch(handleXhrError);

  vnode.state = { };
}

function getPosts(threadId) {
  xhr.message(threadId)
  .then(data => {
    console.log(data);
  })
  .catch(handleXhrError);
}
