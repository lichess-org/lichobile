var m    = require('mithril');

function renderHeader(){
  return m('header', [
    m('nav', [
      m('a.fa.fa-navicon[href="#"]'),
      m('h1', 'lichess.org'),
      m('a.fa.fa-trophy[href="#"]')
    ])
  ]);
}

function renderFooter(){
  return m('footer', [
    m('span.lichess', ["h"]),
    m('span.lichess', ["G"])
  ]);
}

module.exports = function(ctrl, contentF) {
  return m('main', [
    renderHeader(),
    contentF.apply(),
    renderFooter()
  ]);
};
