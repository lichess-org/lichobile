import socket from '../../socket';
import { handleXhrError } from '../../utils';
import * as xhr from './messageXhr';
import * as helper from '../helper';
import * as m from 'mithril';

export default function oninit(vnode) {
  helper.analyticsTrackView('Inbox');

  socket.createDefault();

  xhr.inbox()
  .then(data => {
    console.log(data);
    return (data);
  })
  .catch(handleXhrError);

  vnode.state = { };
}
