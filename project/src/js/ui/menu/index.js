import * as m from 'mithril';
import * as Zanimo from 'zanimo';
import { hasNetwork } from '../../utils';
import session from '../../session';
import redraw from '../../utils/redraw';
import router from '../../router';
import backbutton from '../../backbutton';
import socket from '../../socket';
import * as inboxXhr from '../inbox/inboxXhr';
const menu = {};

let sendPingsInterval;

/* properties */
menu.isOpen = false;
menu.headerOpen = m.prop(false);
menu.inboxUnreadCount = m.prop(null);

menu.mlat = m.prop();
menu.ping = m.prop();

function getServerLags() {
  if (hasNetwork() && session.isConnected()) {
    socket.getCurrentPing()
    .then(ping => {
      menu.ping(ping);
      menu.mlat(socket.getCurrentMoveLatency());
      if (menu.isOpen) redraw();
    });
  }
}

menu.route = function(route) {
  return function() {
    return menu.close().then(router.set.bind(undefined, route));
  };
};

menu.popup = function(action) {
  return function() {
    return menu.close().then(() => {
      action();
      redraw();
    });
  };
};

menu.toggle = function() {
  if (menu.isOpen) menu.close();
  else menu.open();
};

menu.open = function() {
  backbutton.stack.push(menu.close);
  menu.isOpen = true;
  if (hasNetwork()) {
    socket.send('moveLat', true);
  }
  getServerLags();
  sendPingsInterval = setInterval(getServerLags, 1000);
};

menu.close = function(fromBB) {
  if (fromBB !== 'backbutton' && menu.isOpen) backbutton.stack.pop();
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
    menu.headerOpen(false);
    menu.isOpen = false;
    redraw();
  })
  .catch(console.log.bind(console));
};

menu.toggleHeader = function() {
  inboxXhr.inbox()
  .then(data => {
    menu.inboxUnreadCount(data.currentPageResults.reduce((acc, x) => (acc + (x.isUnread ? 1 : 0)), 0));
    redraw();
  });
  return menu.headerOpen() ? menu.headerOpen(false) : menu.headerOpen(true);
};

export default menu;
