var m    = require('mithril');

function renderHeader(){
  return m('header', [
    m('span.lichess', ["."]),
    m('h1.title', [ "lichess.org" ])
  ]);
}

function renderContent(ctrl, contentF){
  return m('div.content', [
    contentF()
  ]);
}

function renderFooter(){
  return m('footer', [
    m('span.lichess', ["h"]),
    m('span.lichess', ["G"])
  ]);
}

module.exports = function(ctrl, contentF) {
  return m('div', [
    renderHeader(),
    renderContent(ctrl, contentF),
    renderFooter()
  ]);
};
