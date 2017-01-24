import * as Zanimo from 'zanimo';
import { hasNetwork } from '../../utils';
import session from '../../session';
import redraw from '../../utils/redraw';
import router from '../../router';
import socket from '../../socket';
import * as inboxXhr from '../inbox/inboxXhr';
import * as stream from 'mithril/stream';

let sendPingsInterval: number;

export const inboxUnreadCount = stream(0);
export const headerOpen = stream(false);
export const isOpen = stream(false);
export const mlat = stream(0);
export const ping = stream(0);

export function getServerLags() {
  if (hasNetwork() && session.isConnected()) {
    socket.getCurrentPing()
    .then((p: number) => {
      ping(p);
      mlat(socket.getCurrentMoveLatency());
      if (isOpen()) redraw();
    });
  }
}

export function route(route: string) {
  return function() {
    return close().then(router.set.bind(undefined, route));
  };
}

export function popup(action: () => void) {
  return function() {
    return close().then(() => {
      action();
      redraw();
    });
  };
}

export function toggle() {
  if (isOpen()) close();
  else open();
}

export function open() {
  router.backbutton.stack.push(close);
  isOpen(true);
  if (hasNetwork()) {
    socket.send('moveLat', true);
  }
  getServerLags();
  sendPingsInterval = setInterval(getServerLags, 1000);
}

export function close(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen()) router.backbutton.stack.pop();
  clearInterval(sendPingsInterval);
  if (hasNetwork()) {
    socket.send('moveLat', false);
  }
  return Zanimo(
    document.getElementById('side_menu'),
    'transform',
    'translate3d(-100%,0,0)', 250, 'ease-out'
  )
  .then(() => {
    headerOpen(false);
    isOpen(false);
    redraw();
  })
  .catch(console.log.bind(console));
}

export function toggleHeader() {
  inboxXhr.inbox(false)
  .then(data => {
    inboxUnreadCount(data.currentPageResults.reduce((acc, x) =>
      (acc + (x.isUnread ? 1 : 0)), 0)
    );
    redraw();
  });
  return headerOpen() ? headerOpen(false) : headerOpen(true);
}
