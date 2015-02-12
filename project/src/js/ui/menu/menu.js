var utils = require('../../utils');
var Zanimo = require('zanimo');

var menu = {};

/* properties */
menu.isOpen = false;
menu.settingsOpen = false;

/* methods */
menu.openSettings = function() {
  window.analytics.trackView('Settings');
  menu.settingsOpen = true;
};

menu.closeSettings = function() {
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
  if (menu.isOpen) menu.isOpen = false;
  else menu.open();
};

menu.open = function() {
  window.analytics.trackView('Main Menu');
  menu.isOpen = true;
};

menu.close = function() {
  menu.isOpen = false;
  menu.closeSettings();
};

module.exports = menu;
