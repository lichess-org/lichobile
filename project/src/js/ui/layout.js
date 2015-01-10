var utils = require('../utils');
var menu = require('./menu');

function headerHeight() {
  var d = utils.getViewportDims();
  return (d.vh - d.vw) / 2;
}

module.exports = {

  base: function(header, content, footer, aside, overlay) {
    var view = [
      m('main#page', { class: menu.isOpen ? 'out' : '' }, [
        m('header.main_header', header()),
        content(),
        m('footer.main_footer', footer())
      ]),
      m('aside#side_menu', aside())
    ];
    if (overlay) view.push(overlay());
    return m('div.view-container', view);
  },

  board: function(header, content, footer, aside, overlay) {
    var view = [
      m('main#page', { class: menu.isOpen ? 'out' : '' }, [
        m('header.main_header.board', { style: { height: headerHeight() + 'px' }}, header()),
        content(),
        m('footer.main_footer.board', { style: { height: headerHeight() + 'px' }}, footer())
      ]),
      m('aside#side_menu', aside())
    ];
    if (overlay) view.push(overlay());
    return m('div.view-container', view);
  }

};
