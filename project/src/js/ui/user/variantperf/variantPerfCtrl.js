import * as xhr from '../userXhr';
import socket from '../../../socket';
import { handleXhrError } from '../../../utils';
import m from 'mithril';

export default function oninit(vnode) {
  const userId = vnode.attrs.id;
  const variant = vnode.attrs.variant;
  const user = m.prop();
  const variantPerfData = m.prop();

  socket.createDefault();

  Promise.all([
    xhr.user(userId),
    xhr.variantperf(userId, variant)
  ])
  .then(results => {
    const [userData, variantData] = results;
    user(userData);
    variantPerfData(variantData);
  })
  .catch(handleXhrError);

  vnode.state = {
    userId,
    variant,
    user,
    variantPerfData
  };
}
