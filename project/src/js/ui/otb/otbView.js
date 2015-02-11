var chessground = require('chessground');
var opposite = chessground.util.opposite;
var layout = require('../layout');
var widgets = require('../_commonWidgets');
var menu = require('../menu');
var ground = require('./ground');
var renderPromotion = require('./promotion').view;
var utils = require('../../utils');
var i18n = require('../../i18n');
var game = require('../round/game');
var renderMaterial = require('../round/view/roundView').renderMaterial;
var replayView = require('./replay/replayView');

function renderAntagonist(ctrl, player, material) {
  return m('section.antagonist', [
    m('div.vertical_align', [
      m('div.infos', [
        m('h2', i18n(player.color)),
        m('div'),
        renderMaterial(material)
      ])
    ])
  ]);
}

function backToGame(ctrl) {
  return m('button[data-icon=L]', {
    config: utils.ontouchend(ctrl.hideActions)
  }, i18n('backToGame'));
}

function renderGameEndedActions(ctrl) {
  var result, status, sit = ctrl.replay.situation();
  if (sit.checkmate) {
    result = sit.turnColor === 'white' ? '0-1' : '1-0';
    status = i18n('checkmate') + '. ' + i18n(sit.color === 'white' ? 'blackIsVictorious' : 'whiteIsVictorious') + '.';
    return m('div.result', [result, m('br'), m('br'), status]);
  }
}

function renderGameRunningActions(ctrl) {
  var d = ctrl.data;
  return [
    m('div.actions', [
      m('button[data-icon=U]', {
        config: utils.ontouchend(utils.ƒ(ctrl.initAs, opposite(d.player.color)))
      }, i18n('createAGame')),
      m('button[data-icon=A]', {
        config: utils.ontouchend(ctrl.showPgn)
      }, i18n('showPGN')),
      m('br'), m('br'), backToGame(ctrl)
    ])
  ];
}

function renderPlayerActions(ctrl) {
  if (!ctrl.vm.showingActions) return;
  return m('div.overlay', [
    m('button.overlay_close.fa.fa-close', {
      config: utils.ontouchend(ctrl.hideActions)
    }),
    m('div#player_controls.overlay_content',
      renderGameEndedActions(ctrl),
      renderGameRunningActions(ctrl)
    )
  ]);
}

function renderPgn(ctrl) {
  if (!ctrl.vm.showingPgn) return;
  var pgn = ctrl.replay.pgn();
  return m('div.overlay', [
    m('button.overlay_close.fa.fa-close', {
      config: utils.ontouchend(ctrl.hidePgn)
    }),
    m('div.overlay_content', m.trust(pgn))
  ]);
}

function renderGameButtons(ctrl) {
  var actions = [
    m('button#open_player_controls.game_action.fa.fa-ellipsis-h', {
      config: utils.ontouchend(ctrl.showActions)
    }),
    m('button.game_action.empty[data-icon=c]'),
    replayView.renderButtons(ctrl.replay)
  ];
  return m('section#game_actions', actions);
}

module.exports = function(ctrl) {

  var material = chessground.board.getMaterialDiff(ctrl.chessground.data);

  function footer() {
    return [
      renderAntagonist(ctrl, ctrl.data.player, material[ctrl.data.player.color]),
      renderGameButtons(ctrl),
      renderPlayerActions(ctrl),
      renderPgn(ctrl)
    ];
  }

  function header() {
    return [
      m('nav', [
        widgets.menuButton(),
        widgets.gameButton(),
        m('h1.playing', i18n('playOnTheBoardOffline'))
      ]),
      renderAntagonist(ctrl, ctrl.data.opponent, material[ctrl.data.opponent.color])
    ];
  }

  function board() {
    var x = utils.getViewportDims().vw;
    return m('section.board_wrapper.otb', {
      style: {
        height: x + 'px'
      }
    }, [
      m('div', {
        class: 'board grey merida standard',
      }, chessground.view(ctrl.chessground), renderPromotion(ctrl))
    ]);
  }

  function renderMenu() {
    return menu.view(utils.partialƒ(ground.applySettings, ctrl.chessground));
  }

  return layout.board(header, board, footer, renderMenu, null, ctrl.data.player.color);
};
