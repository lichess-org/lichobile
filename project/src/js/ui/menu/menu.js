import * as utils from '../../utils';
import Zanimo from 'zanimo';
import backbutton from '../../backbutton';
import m from 'mithril';

const menu = {};

menu.vm = {
  hash: ''
};

/* properties */
menu.isOpen = false;
menu.headerOpen = m.prop(false);

// we need to transition manually the menu on route change, because mithril's
// diff strategy is 'all'
menu.route = function(route) {
  return function() {
    menu.close();
    return Zanimo(document.getElementById('side_menu'), 'transform',
      'translate3d(-100%,0,0)', '250', 'ease-out')
    .then(utils.f(m.route, route))
    .catch(console.log.bind(console));
  };
};

menu.popup = function(action) {
  return function() {
    return Zanimo(document.getElementById('side_menu'), 'transform',
      'translate3d(-100%,0,0)', '250', 'ease-out').then(function(el) {
        m.startComputation();
        action();
        menu.close();
        m.endComputation();
        el.removeAttribute('style');
      })
      .catch(console.log.bind(console));
  };
};

menu.toggle = function() {
  if (menu.isOpen) menu.close();
  else menu.open();
};

menu.open = function() {
  backbutton.stack.push(menu.close);
  menu.isOpen = true;
};

menu.close = function(fromBB) {
  if (fromBB !== 'backbutton' && menu.isOpen) backbutton.stack.pop();
  menu.headerOpen(false);
  menu.isOpen = false;
};

menu.toggleHeader = function() {
  return menu.headerOpen() ? menu.headerOpen(false) : menu.headerOpen(true);
};

export default menu;
