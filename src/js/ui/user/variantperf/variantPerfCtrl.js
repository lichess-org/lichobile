import * as xhr from '../userXhr';
import * as m from 'mithril';
import socket from '../../../socket';
import { handleXhrError } from '../../../utils';
import redraw from '../../../utils/redraw';
import spinner from '../../../spinner';

export default function oninit(vnode) {
  const userId = vnode.attrs.id;
  const variant = vnode.attrs.variant;
  const user = m.prop();
  const variantPerfData = m.prop();

  socket.createDefault();

  spinner.spin();
  Promise.all([
    xhr.user(userId, false),
    xhr.variantperf(userId, variant)
  ])
  .then(results => {
    spinner.stop();
    const [userData, variantData] = results;
    user(userData);
    variantPerfData(variantData);
    redraw();
  })
  .catch(err => {
    spinner.stop();
    handleXhrError(err);
  });

  vnode.state = {
    userId,
    variant,
    user,
    variantPerfData
  };
}
