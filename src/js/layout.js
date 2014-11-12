var m = require('mithril');

function HeaderHeight() {
  var vw = document.documentElement.clientWidth,
  vh = document.documentElement.clientHeight;
  return (vh - vw) / 2;
}

function renderHeader(ctrl, headerView) {
  var children = [
    m('nav', [
      m('a.fa.fa-navicon', { config: function(el, isUpdate) {
        if (!isUpdate) el.addEventListener('touchstart', ctrl.menu.toggle);
      }}),
      m('h1', 'lichess.org'),
      m('a.fa.fa-trophy[href="#"]')
    ])
  ];

  return m('header',
    { style: { height: HeaderHeight() + 'px' }},
    children.concat(headerView())
  );
}

function renderFooter(ctrl, footerView){
  return m('footer',
    { style: { height: HeaderHeight() + 'px' }},
    footerView()
  );
}

/**
 * Main layout function
 *
 * @param {function} headerView A function that returns an array of m() ie.
 * mithril's virtual elements
 * @param {function} contentView A function that returns a m()
 * @param {function} footerView A function that returns an array of m()
 * @param {function} menuView A function that returns an array of m()
 */
module.exports = function(ctrl, headerView, contentView, footerView, menuView) {
  return [
    m('main', { class: ctrl.menu.isOpen ? 'out' : '' }, [
      renderHeader(ctrl, headerView),
      contentView(),
      renderFooter(ctrl, footerView)
    ]),
    m('aside', menuView())
  ];
};
