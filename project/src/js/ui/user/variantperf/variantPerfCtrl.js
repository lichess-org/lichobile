import * as xhr from '../userXhr';
import router from '../../../router';
import socket from '../../../socket';
import { handleXhrError } from '../../../utils';
import m from 'mithril';

export default function oninit(vnode) {
  const userId = vnode.attrs.id;
  const variant = vnode.attrs.variant;
  const user = m.prop();
  const variantPerfData = m.prop();

  socket.createDefault();

  xhr.user(userId)
  .run(data => {
    user(data);
    return data;
  })
  .catch(error => {
    handleXhrError(error);
    router.set('/');
    throw error;
  });

  xhr.variantperf(userId, variant)
  .run(data => {
    variantPerfData(data);
    return data;
  })
  .catch(error => {
    handleXhrError(error);
    router.set('/');
    throw error;
  });

  vnode.state = {
    userId,
    variant,
    user,
    variantPerfData
  };
}
