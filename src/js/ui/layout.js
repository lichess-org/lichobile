var utils = require('../utils');
var menu = require('./menu');

function headerHeight() {
  var d = utils.getViewportDims();
  return (d.vh - d.vw) / 2;
}

/**
 * Main layout function
 *
 * @param {function} headerView A function that returns an array of m()
 * @param {function} contentView A function that returns a m()
 * @param {function} footerView A function that returns an array of m()
 * @param {function} menuView A function that returns an array of m()
 * @param {function} overlaysView A function that returns an array of m()
 */
module.exports = function(headerView, contentView, footerView, menuView, overlaysView) {
  var layout = [
    m('main', { class: menu.isOpen ? 'out' : '' }, [
      m('header', { style: { height: headerHeight() + 'px' }}, headerView()),
      contentView(),
      m('footer', { style: { height: headerHeight() + 'px' }}, footerView())
    ]),
    m('aside', menuView())
  ];
  if (overlaysView) layout.push(overlaysView());
  return layout;
};
