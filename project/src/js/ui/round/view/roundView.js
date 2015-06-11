/** @jsx m */
import chessground from 'chessground';
import settings from '../../../settings';
import layout from '../../layout';
import widgets from '../../widget/common';
import popupWidget from '../../widget/popup';
import { view as renderClock } from '../clock/clockView';
import { view as renderPromotion } from '../promotion';
import utils from '../../../utils';
import helper from '../../helper';
import i18n from '../../../i18n';
import button from './button';
import gameApi from '../../../lichess/game';
import gameStatusApi from '../../../lichess/status';
import replayView from '../replay/replayView';
import { view as renderChat } from '../chat';
import renderCorrespondenceClock from '../correspondenceClock/correspondenceView';
import variantApi from '../../../lichess/variant';

export default function view(ctrl) {

  function header() {
    return [
      m('nav', {
        className: ctrl.vm.connectedWS ? '' : 'reconnecting'
      }, [
        widgets.menuButton(),
        ctrl.vm.connectedWS ? m('h1.playing', ctrl.title) : m('h1.reconnecting', [
          i18n('reconnecting'),
          widgets.loader
        ]),
        widgets.headerBtns()
      ])
    ];
  }

  return layout.board(header, renderContent.bind(undefined, ctrl), null);
}

function renderContent(ctrl) {
  const x = helper.viewportDim().vw;
  const boardStyle = helper.isLandscape() ? {} : { width: x + 'px', height: x + 'px' };
  const boardKey = helper.isLandscape() ? 'landscape' : 'portrait';
  const boardClass = [
    'board',
    settings.general.theme.board(),
    settings.general.theme.piece(),
    ctrl.data.game.variant.key
  ].join(' ');
  const material = chessground.board.getMaterialDiff(ctrl.chessground.data);

  return (
    <div className="content">
      {renderAntagonist(ctrl, ctrl.data.opponent, material[ctrl.data.opponent.color], 'top')}
      <section key={boardKey} className="board_wrapper" style={boardStyle}>
        <div className={boardClass}>
          {chessground.view(ctrl.chessground)}
          {renderPromotion(ctrl)}
        </div>
      </section>
      {renderAntagonist(ctrl, ctrl.data.player, material[ctrl.data.player.color], 'bottom')}
      {renderGameButtons(ctrl)}
      {renderPlayerActions(ctrl)}
      {ctrl.chat ? renderChat(ctrl.chat) : null}
    </div>
  );
}

export function renderMaterial(material) {
  var children = [];
  for (var role in material) {
    var piece = m('div.' + role);
    var count = material[role];
    var content;
    if (count === 1) content = piece;
    else {
      content = [];
      for (var i = 0; i < count; i++) content.push(piece);
    }
    children.push(m('div.tomb', content));
  }
  return children;
}

function compact(x) {
  if (Object.prototype.toString.call(x) === '[object Array]') {
    var elems = x.filter(function(n) {
      return n !== undefined;
    });
    return elems.length > 0 ? elems : null;
  }
  return x;
}

function ratingDiff(player) {
  if (typeof player.ratingDiff === 'undefined') return null;
  if (player.ratingDiff === 0) return m('span.rp.null', 0);
  if (player.ratingDiff > 0) return m('span.rp.up', ' +' + player.ratingDiff);
  if (player.ratingDiff < 0) return m('span.rp.down', ' ' + player.ratingDiff);
}

function renderCheckCount(ctrl, color) {
  var player = color === ctrl.data.player.color ? ctrl.data.opponent : ctrl.data.player;
  if (typeof player.checks !== 'undefined') return m('div.checks', player.checks);
}

function renderAntagonist(ctrl, player, material, position) {
  const user = player.user;
  const playerName = utils.playerName(player);
  const {vh, vw} = helper.viewportDim();
  // must do this here because of the lack of `calc` support
  // 50 refers to either header height of game actions bar height
  const style = helper.isLandscape() ? {} : { height: ((vh - vw) / 2 - 50) + 'px' };
  const key = helper.isLandscape() ? position + 'landscape' : position + 'portrait';

  function infos() {
    let title;
    if (user) {
      let onlineStatus = user.online ? 'connected to lichess' : 'offline';
      let onGameStatus = player.onGame ? 'currently on this game' : 'currently not on this game';
      title = `${playerName}: ${onlineStatus}; ${onGameStatus}`;
    } else
      title = playerName;
    window.plugins.toast.show(title, 'short', 'center');
  }

  return m('section.antagonist', { className: position, key, style }, [
    m('div.infos', {
      config: user ?
        helper.ontouch(utils.f(m.route, '/@/' + user.id), infos) :
        utils.noop
    }, [
      m('h2.user', [
        m('span.status[data-icon=r]', { className: user && user.online ? 'online' : 'offline' }),
        playerName,
        player.onGame ? m('span.ongame.yes[data-icon=3]') : m('span.ongame.no[data-icon=0]')
      ]),
      m('div', [
        user ? m('h3.rating', [
          player.rating,
          ratingDiff(player)
        ]) : null,
        renderCheckCount(ctrl, player.color),
        ctrl.data.game.variant.key === 'horde' ? null : renderMaterial(material)
      ])
    ]),
    ctrl.clock ? renderClock(ctrl.clock, player.color, ctrl.isClockRunning() ? ctrl.data.game.player : null) : (
      ctrl.data.correspondence ? renderCorrespondenceClock(
        ctrl.correspondenceClock, i18n, player.color, ctrl.data.game.player
      ) : null
    )
  ]);
}

function renderGameRunningActions(ctrl) {
  if (ctrl.data.player.spectator) return m('div.game_controls', [
    button.shareLink(ctrl),
    button.flipBoard(ctrl)
  ]);

  var d = ctrl.data;
  var answerButtons = compact([
    button.cancelDrawOffer(ctrl),
    button.answerOpponentDrawOffer(ctrl),
    button.cancelTakebackProposition(ctrl),
    button.answerOpponentTakebackProposition(ctrl),
    (gameApi.mandatory(d) && gameApi.nbMoves(d, d.player.color) === 0) ? m('div.text[data-icon=j]',
      i18n('youHaveNbSecondsToMakeYourFirstMove', 30)
    ) : undefined
  ]);
  return [
    m('div.game_controls', [
      button.shareLink(ctrl),
      button.flipBoard(ctrl),
      button.moretime(ctrl),
      button.standard(ctrl, gameApi.abortable, 'L', 'abortGame', 'abort'),
      button.forceResign(ctrl) || [
        button.standard(ctrl, gameApi.takebackable, 'i', 'proposeATakeback', 'takeback-yes'),
        button.standard(ctrl, gameApi.drawable, '2', 'offerDraw', 'draw-yes'),
        button.standard(ctrl, gameApi.resignable, 'b', 'resign', 'resign'),
        button.threefoldClaimDraw(ctrl)
      ]
    ]),
    answerButtons ? m('div.answers', answerButtons) : null
  ];
}

function renderGameEndedActions(ctrl) {
  var result = gameApi.result(ctrl.data);
  var winner = gameApi.getPlayer(ctrl.data, ctrl.data.game.winner);
  var status = gameStatusApi.toLabel(ctrl.data.game.status.name, ctrl.data.game.winner, ctrl.data.game.variant.key) +
    (winner ? '. ' + i18n(winner.color === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '');
  const resultDom = gameStatusApi.aborted(ctrl.data) ? [] : [
    result, m('br'), m('br')
  ];
  resultDom.push(m('div.status', status));
  const buttons = ctrl.data.player.spectator ? [
    button.shareLink(ctrl),
    button.flipBoard(ctrl)
  ] : [
    button.shareLink(ctrl),
    button.flipBoard(ctrl),
    button.answerOpponentRematch(ctrl),
    button.cancelRematch(ctrl),
    button.rematch(ctrl)
  ];
  return [
    m('div.result', resultDom),
    m('div.control.buttons', buttons)
  ];
}

function gameInfos(data) {
  var time = gameApi.time(data);
  var mode = data.game.rated ? i18n('rated') : i18n('casual');
  var icon = data.opponent.ai ? ':' : utils.gameIcon(data.game.perf);
  var variant = m('span.variant', {
    config: helper.ontouch(
      () => {
        var link = variantApi(data.game.variant.key).link;
        if (link)
          window.open(link, '_blank', 'location=no');
      },
      () => window.plugins.toast.show(data.game.variant.title, 'short', 'center')
    )
  }, data.game.variant.name);
  var infos = [time + ' • ', variant, m('br'), mode];
  return [
    m('div.icon-game', {
      'data-icon': icon ? icon : ''
    }),
    m('div.game-title.no_select', infos)
  ];
}

function renderPlayerActions(ctrl) {
  return popupWidget(
    'player_controls',
    gameInfos(ctrl.data),
    gameApi.playable(ctrl.data) ?
      renderGameRunningActions(ctrl) : renderGameEndedActions(ctrl),
    ctrl.vm.showingActions,
    ctrl.hideActions
  );
}

function renderGameButtons(ctrl) {
  var actions = [
    m('button#open_player_controls.game_action.fa.fa-ellipsis-h', {
      className: helper.classSet({
        'answer_required': ctrl.data.opponent.proposingTakeback ||
          ctrl.data.opponent.offeringDraw ||
          gameApi.forceResignable(ctrl.data) ||
          ctrl.data.opponent.offeringRematch
      }),
      config: helper.ontouch(ctrl.showActions)
    }),
    ctrl.chat ? m('button#open_chat.game_action[data-icon=c]', {
      className: helper.classSet({
        unread: ctrl.chat.unread
      }),
      config: helper.ontouch(ctrl.chat.open || utils.noop)
    }) : m('button.game_action.empty[data-icon=c]'),
    replayView.renderButtons(ctrl.replay)
  ];
  return m('section#game_actions', actions);
}
