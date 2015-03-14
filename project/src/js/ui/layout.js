var utils = require('../utils');
var menu = require('./menu');
var gamesMenu = require('./gamesMenu');
var loginModal = require('./loginModal');
var signupModal = require('./signupModal');
var helper = require('./helper');

function headerHeight() {
  var d = utils.getViewportDims();
  return (d.vh - d.vw) / 2;
}

module.exports = {

  board: function(header, content, footer, aside, overlay, povColor) {
    var view = [
      m('main#page', {
        className: [
          menu.isOpen ? 'out' : 'in',
          povColor || 'white'
        ].join(' ')
      }, [
        m('header.main_header.board', { style: { height: headerHeight() + 'px' }}, header()),
        content(),
        m('footer.main_footer.board', { style: { height: headerHeight() + 'px' }}, footer()),
        m('div.menu-close-overlay', {
          config: helper.ontouchend(menu.close)
        })
      ]),
      aside(),
      gamesMenu.view(),
      loginModal.view(),
      signupModal.view()
    ];
    if (overlay) view.push(overlay());
    return m('div.view-container', view);
  },

  free: function(header, content, footer, aside, overlay) {
    var view = [
      m('main#page', {
        className: menu.isOpen ? 'out' : 'in'
      }, [
        m('header.main_header', header()),
        m('div.content', { config: helper.scale }, content()),
        m('footer.main_footer', footer()),
        m('div.menu-close-overlay', {
          config: helper.ontouchend(menu.close)
        })
      ]),
      aside(),
      gamesMenu.view(),
      loginModal.view(),
      signupModal.view()
    ];
    if (overlay) view.push(overlay());
    return m('div.view-container', view);
  }

};
