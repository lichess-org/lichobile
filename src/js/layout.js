var m = require('mithril');

function HeaderHeight() {
  var vw = document.documentElement.clientWidth,
  vh = document.documentElement.clientHeight;
  return (vh - vw) / 2;
}

function renderHeader(headerView) {
  var children = [
    m('nav', [
      m('a.fa.fa-navicon[href="#"]'),
      m('h1', 'lichess.org'),
      m('a.fa.fa-trophy[href="#"]')
    ])
  ];

  return m('header',
    { style: { height: HeaderHeight() + 'px' }},
    children.concat(headerView.call())
  );
}

function renderFooter(footerView){
  return m('footer',
    { style: { height: HeaderHeight() + 'px' }},
    footerView.call()
  );
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
  return [
    m('main', [
      renderHeader(headerView),
      contentView.call(),
      renderFooter(footerView)
    ]),
    m('aside', [
      m('header', [m('nav', [m('h2', 'Settings')])]),
      m('div', [
        m('form', [
          m('h3', 'Connection'),
          m('input#pseudo[type=text][placeholder=Pseudo'),
          m('input#password[type=password][placeholder=Password]'),
          m('button#login', 'LOG IN')
        ]),
      ])
    ])
  ];
};
