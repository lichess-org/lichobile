import Zanimo from 'zanimo';
import backbutton from '../../backbutton';
import m from 'mithril';
import socket from '../../socket';

const menu = {};

/* properties */
menu.isOpen = false;
menu.headerOpen = m.prop(false);
menu.sendPingsInterval = null;

menu.route = function(route) {
  return function() {
    return menu.close().then(m.route.bind(undefined, route));
  };
};

menu.popup = function(action) {
  return function() {
    return menu.close().then(() => {
      action();
      m.redraw();
    });
  };
};

menu.toggle = function() {
  if (menu.isOpen) menu.close();
  else menu.open();
};

menu.open = function() {
  console.log('open');
  backbutton.stack.push(menu.close);
  menu.isOpen = true;
  sendPings();
  menu.sendPingsInterval = setInterval(sendPings, 1000);
};

menu.close = function(fromBB) {
  if (fromBB !== 'backbutton' && menu.isOpen) backbutton.stack.pop();
  m.redraw.strategy('none');
  clearInterval(menu.sendPingsInterval);
  return Zanimo(
    document.getElementById('side_menu'),
    'transform',
    'translate3d(-100%,0,0)', 250, 'ease-out'
  ).then(() => {
    menu.headerOpen(false);
    menu.isOpen = false;
    m.redraw();
  })
  .catch(console.log.bind(console));
};

menu.toggleHeader = function() {
  return menu.headerOpen() ? menu.headerOpen(false) : menu.headerOpen(true);
};

function sendPings() {
  console.log('sent pings');
  socket.getAverageLag(function(lag) {
    socket.userPing(lag);
    console.log('lag: ' + lag);
    m.redraw();
  });
  socket.send('moveLat', true);
  console.log('sent mlat');
}

export default menu;
