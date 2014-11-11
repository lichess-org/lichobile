var m    = require('mithril');

function renderHeader(headerView){
  var children = [
    m('nav', [
      m('a.fa.fa-navicon[href="#"]'),
      m('h1', 'lichess.org'),
      m('a.fa.fa-trophy[href="#"]')
    ])
  ];

  return m('header', children.concat(headerView.call()));
}

function renderFooter(footerView){
  return m('footer', footerView.call());
}

/**
 * Main layout function
 *
 * @param {function} headerView A function that returns an array of mithril's
 * virtual elements
 * @param {function} contentView A function that returns a mithril virtual el
 * @param {function} footerView A function that returns an array of mithril's
 * virtual elements
 */
module.exports = function(headerView, contentView, footerView) {
  return m('main', [
    renderHeader(headerView),
    contentView.call(),
    renderFooter(footerView)
  ]);
};
