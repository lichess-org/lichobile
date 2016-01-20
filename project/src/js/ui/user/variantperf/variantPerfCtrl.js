import * as xhr from '../userXhr';
import IScroll from 'iscroll/build/iscroll-probe';
import {throttle} from 'lodash/function';
import socket from '../../../socket';
import * as utils from '../../../utils';
import m from 'mithril';

var scroller;

export default function controller() {
  const userId = m.route.param('id');
  const variant = m.route.param('variant');
  const user = m.prop();
  const variantPerfData = m.prop();
  const games = m.prop([]);

  socket.createDefault();

  xhr.user(userId).then(data => {
    user(data);
    return data;
  }, error => {
    utils.handleXhrError(error);
    m.route('/');
    throw error;
  });

  xhr.variantperf(userId, variant).then(data => {
    variantPerfData(data);
    return data;
  }, error => {
    utils.handleXhrError(error);
    m.route('/');
    throw error;
  });

  return {
    userId,
    variant,
    user,
    variantPerfData,
    onunload() {
      socket.destroy();
    }
  };
}
