var layout = require('./layout');
var menu = require('./menu');
var utils = require('../utils');
var gamesMenu = require('./gamesMenu');

var home = {};

home.controller = function() {};

home.view = function() {
  function header() {
    return [
      m('nav', [
        m('button.fa.fa-navicon', {
          config: utils.ontouchend(menu.toggle)
        }),
        m('h1', 'lichess.org'),
        m('button.fa.fa-star', {
          config: utils.ontouchend(gamesMenu.open)
        })
      ])
    ];
  }

  function board() {
    var vw = utils.getViewportDims().vw;
    return m('section', {
      style: {
        height: vw + 'px'
      }
    }, [utils.viewOnlyBoard()]);
  }

  function footer() {
    return [];
  }

  function overlays() {
    return [
      gamesMenu.view()
    ];
  }

  return layout(header, board, footer, menu.view, overlays);
};

module.exports = home;
