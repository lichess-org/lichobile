import * as xhr from '../userXhr';
import socket from '../../../socket';
import * as utils from '../../../utils';
import m from 'mithril';

export default function controller() {
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
    utils.handleXhrError(error);
    m.route.set('/');
    throw error;
  });

  xhr.variantperf(userId, variant)
  .run(data => {
    variantPerfData(data);
    return data;
  })
  .catch(error => {
    utils.handleXhrError(error);
    m.route.set('/');
    throw error;
  });

  return {
    userId,
    variant,
    user,
    variantPerfData
  };
}
