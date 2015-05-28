var chessground = require('chessground');
var layout = require('../layout');
var widgets = require('../widget/common');
var renderPromotion = require('./promotion').view;
var helper = require('../helper');
var i18n = require('../../i18n');
var renderMaterial = require('../round/view/roundView').renderMaterial;
var replayView = require('./replay/replayView');
var actions = require('./actions');
var settings = require('../../settings');

function renderAntagonist(ctrl, player, material) {
  return m('section.antagonist', [
    m('div.infos', [
      m('h2', i18n(player.color)),
      m('div'),
      renderMaterial(material)
    ])
  ]);
}

function renderGameButtons(ctrl) {
  var vdom = [
    m('button#open_player_controls.game_action.fa.fa-ellipsis-h', {
      config: helper.ontouch(ctrl.actions.open)
    }),
    m('button.game_action.empty[data-icon=c]'),
    replayView.renderButtons(ctrl.replay)
  ];
  return m('section#game_actions', vdom);
}

module.exports = function(ctrl) {

  var material = chessground.board.getMaterialDiff(ctrl.chessground.data);

  function footer() {
    return [
      renderAntagonist(ctrl, ctrl.data.player, material[ctrl.data.player.color]),
      renderGameButtons(ctrl),
      actions.view(ctrl.actions)
    ];
  }

  function header() {
    return [
      m('nav', [
        widgets.menuButton(),
        m('h1.playing', i18n('playOnTheBoardOffline')),
        widgets.headerBtns()
      ]),
      renderAntagonist(ctrl, ctrl.data.opponent, material[ctrl.data.opponent.color])
    ];
  }

  function board() {
    var x = helper.viewportDim().vw;
    var flip = settings.otb.flipPieces();
    return m('section', {
      className: helper.classSet({
        'board_wrapper': true,
        'otb': true,
        'mode_flip': flip,
        'mode_facing': !flip,
        'turn_white': ctrl.chessground.data.turnColor === 'white',
        'turn_black': ctrl.chessground.data.turnColor === 'black'
      }),
      style: {
        height: x + 'px'
      }
    }, [
      m('div.board', {
        className: [
          settings.general.theme.board(),
          settings.general.theme.piece(),
          'standard'
        ].join(' ')
      }, chessground.view(ctrl.chessground), renderPromotion(ctrl))
    ]);
  }

  return layout.board(header, board, footer, null, ctrl.data.player.color);
};
