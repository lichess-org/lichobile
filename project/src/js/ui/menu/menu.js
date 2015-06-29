import * as utils from '../../utils';
import Zanimo from 'zanimo';
import backbutton from '../../backbutton';
import helper from '../helper';

var menu = {};

/* properties */
menu.isOpen = false;
menu.headerOpen = m.prop(false);

// we need to transition manually the menu on route change, because mithril's
// diff strategy is 'all'
menu.route = function(route) {
  return function() {
    menu.close();
    return Zanimo(document.getElementById('side_menu'), 'transform', 'translate3d(-100%,0,0)',
      '250', 'ease-out').then(utils.f(m.route, route)).done();
  };
};

menu.popup = function(action) {
  return function() {
    menu.close();
    return Zanimo(document.getElementById('side_menu'), 'transform', 'translate3d(-100%,0,0)',
      '250', 'ease-out').then(function(el) {
        m.startComputation();
        action();
        m.endComputation();
        el.removeAttribute('style');
      }).done();
  };
};

menu.toggle = function() {
  if (menu.isOpen) menu.close();
  else menu.open();
};

menu.open = function() {
  helper.analyticsTrackView('Main Menu');
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

module.exports = menu;
