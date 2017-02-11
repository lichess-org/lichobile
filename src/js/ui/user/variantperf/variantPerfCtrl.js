import * as xhr from '../userXhr';
import socket from '../../../socket';
import { handleXhrError } from '../../../utils';
import redraw from '../../../utils/redraw';
import spinner from '../../../spinner';
import * as stream from 'mithril/stream';

export default function oninit(vnode) {
  const userId = vnode.attrs.id;
  const variant = vnode.attrs.variant;
  const user = stream();
  const variantPerfData = stream();

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
