var utils = require('../utils');
var menu = require('./menu');
var gamesMenu = require('./gamesMenu');
var loginModal = require('./loginModal');

function headerHeight() {
  var d = utils.getViewportDims();
  return (d.vh - d.vw) / 2;
}

module.exports = {

  board: function(header, content, footer, aside, overlay) {
    var view = [
      m('main#page', {
        class: menu.isOpen ? 'out' : ''
      }, [
        m('header.main_header.board', { style: { height: headerHeight() + 'px' }}, header()),
        content(),
        m('footer.main_footer.board', { style: { height: headerHeight() + 'px' }}, footer()),
        m('div.menu-close-overlay', {
          config: utils.ontouchend(menu.close)
        })
      ]),
      m('aside#side_menu', aside()),
      gamesMenu.view(),
      loginModal.view()
    ];
    if (overlay) view.push(overlay());
    return m('div.view-container', view);
  }

};
