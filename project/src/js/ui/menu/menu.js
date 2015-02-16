var utils = require('../../utils');
var Zanimo = require('zanimo');
var backbutton = require('../../backbutton');

var menu = {};

/* properties */
menu.isOpen = false;
menu.settingsOpen = false;

/* methods */
menu.openSettings = function() {
  window.analytics.trackView('Settings');
  backbutton.stack.push(menu.closeSettings);
  menu.settingsOpen = true;
};

menu.closeSettings = function(fromBB) {
  if (!fromBB && menu.settingsOpen) backbutton.stack.pop();
  menu.settingsOpen = false;
};

// we need to transition manually the menu on route change, because mithril's
// diff strategy is 'all'
menu.menuRouteAction = function(route) {
  return function() {
    menu.close();
    return Zanimo(document.getElementById('side_menu'), 'transform', 'translate3d(-100%,0,0)',
      '250', 'ease-out').then(utils.ƒ(m.route, route));
  };
};

menu.toggle = function() {
  if (menu.isOpen) menu.close();
  else menu.open();
};

menu.open = function() {
  window.analytics.trackView('Main Menu');
  backbutton.stack.push(menu.close);
  menu.isOpen = true;
};

menu.close = function(fromBB) {
  if (menu.settingsOpen) menu.closeSettings();
  if (!fromBB && menu.isOpen) backbutton.stack.pop();
  menu.isOpen = false;
};

module.exports = menu;
