var utils = require('../utils');
var menu = require('./menu');
var gamesMenu = require('./gamesMenu');
var loginModal = require('./loginModal');

function headerHeight() {
  var d = utils.getViewportDims();
  return (d.vh - d.vw) / 2;
}

module.exports = {

  board: function(header, content, footer, aside, overlay, povColor) {
    var view = [
      menu.isOpen ? m('div.close-overlay', {
        onclick: menu.close
      }) : null,
      m('main#page', {
        class: [
          menu.isOpen ? 'out' : '',
          povColor || 'white'
        ].join(' ')
      }, [
        m('header.main_header.board', { style: { height: headerHeight() + 'px' }}, header()),
        content(),
        m('footer.main_footer.board', { style: { height: headerHeight() + 'px' }}, footer())
      ]),
      m('aside#side_menu', aside()),
      gamesMenu.view(),
      loginModal.view()
    ];
    if (overlay) view.push(overlay());
    return m('div.view-container', view);
  }

};
