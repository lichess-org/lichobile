import * as m from 'mithril';
import * as Zanimo from 'zanimo';
import redraw from '../../utils/redraw';
import router from '../../router';
import backbutton from '../../backbutton';
import socket from '../../socket';

const menu = {};

/* properties */
menu.isOpen = false;
menu.headerOpen = m.prop(false);

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
  getServerLag();
  menu.sendPingsInterval = setInterval(getServerLag, 1000);
};

menu.close = function(fromBB) {
  if (fromBB !== 'backbutton' && menu.isOpen) backbutton.stack.pop();
  m.redraw.strategy('none');
  clearInterval(menu.sendPingsInterval);
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
  return menu.headerOpen() ? menu.headerOpen(false) : menu.headerOpen(true);
};

function getServerLag() {
  socket.send('moveLat', true);
}

menu.pingUpdate = function () {
  if (menu.isOpen) m.redraw();
};

menu.lagUpdate = function () {
  if (menu.isOpen) m.redraw();
};

export default menu;
