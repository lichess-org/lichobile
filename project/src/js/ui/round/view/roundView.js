import chessground from 'chessground';
import settings from '../../../settings';
import layout from '../../layout';
import { menuButton, loader, headerBtns } from '../../shared/common';
import popupWidget from '../../shared/popup';
import formWidgets from '../../shared/form';
import { view as renderClock } from '../clock/clockView';
import { view as renderPromotion } from '../promotion';
import * as utils from '../../../utils';
import helper from '../../helper';
import i18n from '../../../i18n';
import button from './button';
import gameApi from '../../../lichess/game';
import { perfTypes } from '../../../lichess/perfs';
import gameStatusApi from '../../../lichess/status';
import { view as renderChat } from '../chat';
import { view as renderCorrespondenceClock } from '../correspondenceClock/correspondenceView';
import variantApi from '../../../lichess/variant';
import { renderTable as renderReplayTable } from './replay';
import socket from '../../../socket';
import m from 'mithril';

export default function view(ctrl) {
  function overlay() {
    return [
      ctrl.chat ? renderChat(ctrl.chat) : null,
      renderPromotion(ctrl),
      renderGamePopup(ctrl),
      renderSubmitMovePopup(ctrl)
    ];
  }

  return layout.board(
    renderHeader.bind(undefined, ctrl),
    renderContent.bind(undefined, ctrl),
    overlay
  );
}

export function renderMaterial(material) {
  const children = [];
  for (let role in material) {
    let piece = <div className={role} />;
    let count = material[role];
    let content;
    if (count === 1) content = piece;
    else {
      content = [];
      for (let i = 0; i < count; i++) content.push(piece);
    }
    children.push(<div className="tomb">{content}</div>);
  }
  return children;
}

export function renderBoard(ctrl, moreWrapperClasses, withStyle = true) {
  const { vh, vw } = helper.viewportDim();
  // ios 7.1 still doesn't support vh unit in calc
  // see board-content.styl section '.board_wrapper' for corresponding calc() rules
  const landscapeDim = (vh > 700 && vw < 1050) ? vh - 50 - vh * 0.12 : vh - 50;
  const boardStyle = helper.isLandscape() ? {
    width: landscapeDim + 'px',
    height: landscapeDim + 'px'
  } : {
    width: vw + 'px',
    height: vw + 'px'
  };
  const boardKey = helper.isLandscape() ? 'landscape' : 'portrait';
  const boardClass = [
    'board',
    settings.general.theme.board(),
    settings.general.theme.piece(),
    ctrl.data.game.variant.key
  ].join(' ');
  let wrapperClass = 'board_wrapper';

  if (moreWrapperClasses) {
    wrapperClass += ' ';
    wrapperClass += moreWrapperClasses;
  }

  return (
    <section key={boardKey} className={wrapperClass} style={withStyle ? boardStyle : {}}>
      <div className={boardClass}>
        {chessground.view(ctrl.chessground)}
      </div>
    </section>
  );
}

function renderHeader(ctrl) {
  return [
    m('nav', {
      className: socket.isConnected() ? '' : 'reconnecting'
    }, [
      menuButton(),
      socket.isConnected() ? m('h1.playing', [
        ctrl.data.userTV ? m('span.withIcon[data-icon=1]') : null,
        ctrl.title
      ]) : utils.hasNetwork() ? m('h1.reconnecting.withTitle', [
        i18n('reconnecting'),
        loader
      ]) : m('h1', 'Offline'),
      headerBtns()
    ])
  ];
}

function renderContent(ctrl) {
  const material = chessground.board.getMaterialDiff(ctrl.chessground.data);
  const replayTable = renderReplayTable(ctrl);
  const player = renderPlayTable(ctrl, ctrl.data.player, material[ctrl.data.player.color], 'player');
  const opponent = renderPlayTable(ctrl, ctrl.data.opponent, material[ctrl.data.opponent.color], 'opponent');

  if (helper.isPortrait())
    return [
      opponent,
      renderBoard(ctrl),
      player,
      renderGameActionsBar(ctrl)
    ];
  else
    return [
      renderBoard(ctrl),
      <section key="table" className="table">
        <header className="tableHeader">
          {gameInfos(ctrl.data)}
        </header>
        <section className="playersTable">
          {opponent}
          {replayTable}
          {player}
        </section>
        {renderGameActionsBar(ctrl)}
      </section>
    ];
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
  if (player.ratingDiff === 0) return m('span.rp.null', ' +0');
  if (player.ratingDiff > 0) return m('span.rp.up', ' +' + player.ratingDiff);
  if (player.ratingDiff < 0) return m('span.rp.down', ' ' + player.ratingDiff);
}

function renderCheckCount(ctrl, color) {
  var player = color === ctrl.data.player.color ? ctrl.data.opponent : ctrl.data.player;
  if (typeof player.checks !== 'undefined') return m('div.checkCount', player.checks);
}

function renderSubmitMovePopup(ctrl) {
  if (!ctrl.vm.moveToSubmit)
    return <div className="overlay_popup_wrapper submitMovePopup" />;

  return (
    <div className="overlay_popup_wrapper submitMovePopup open">
      <div className="overlay_popup">
        {button.submitMove(ctrl)}
      </div>
    </div>
  );
}

function userInfos(user, player, playerName) {
  let title;
  if (user) {
    let onlineStatus = user.online ? 'connected to lichess' : 'offline';
    let onGameStatus = player.onGame ? 'currently on this game' : 'currently not on this game';
    title = `${playerName}: ${onlineStatus}; ${onGameStatus}`;
  } else
    title = playerName;
  window.plugins.toast.show(title, 'short', 'center');
}

function renderAntagonistInfo(ctrl, player, material) {
  const user = player.user;
  const playerName = utils.playerName(player, helper.isLandscape());

  return m('div.antagonistInfos', {
    config: user ?
      helper.ontouch(utils.f(m.route, '/@/' + user.id), () => userInfos(user, player, playerName)) :
      utils.noop
  }, [
    m('h2.antagonistUser', [
      user ? m('span.status[data-icon=r]', { className: user.online ? 'online' : 'offline' }) : null,
      playerName,
      player.onGame ? m('span.ongame.yes[data-icon=3]') : m('span.ongame.no[data-icon=0]')
    ]),
    m('div.ratingAndMaterial', [
      user && helper.isPortrait() ? m('h3.rating', [
        player.rating,
        player.provisional ? '?' : '',
        ratingDiff(player)
      ]) : null,
      renderCheckCount(ctrl, player.color),
      ctrl.data.game.variant.key === 'horde' ? null : renderMaterial(material)
    ])
  ]);
}

function renderPlayTable(ctrl, player, material, position) {
  const {vh, vw} = helper.viewportDim();
  const headerHeight = vh > 480 ? 50 : 40;
  const contentHeight = vh - headerHeight;
  // must do this here because of the lack of `calc` support
  // 45 refers to game actions bar height
  const style = helper.isLandscape() ? {} : { height: ((contentHeight - vw - 45) / 2) + 'px' };
  const key = helper.isLandscape() ? position + '-landscape' : position + '-portrait';

  return m('section.playTable', { className: position, key, style }, [
    renderAntagonistInfo(ctrl, player, material),
    ctrl.clock ? renderClock(ctrl.clock, player.color, ctrl.isClockRunning() ? ctrl.data.game.player : null) : (
      ctrl.data.correspondence ? renderCorrespondenceClock(
        ctrl.correspondenceClock, player.color, ctrl.data.game.player
      ) : null
    )
  ]);
}

function tvChannelSelector(ctrl) {
  let channels = perfTypes.filter(e => e[0] !== 'correspondence').map(e => [e[1], e[0]]);
  channels.unshift(['Top rated', 'best']);
  channels.push(['Computer', 'computer']);

  return m('div.action', m('div.select_input',
    formWidgets.renderSelect('TV channel', 'tvChannel', channels, settings.tv.channel,
      false, ctrl.onTVChannelChange)
  ));
}

function renderGameRunningActions(ctrl) {
  if (ctrl.data.player.spectator) {
    let controls = [
      button.shareLink(ctrl),
      ctrl.data.tv ? tvChannelSelector(ctrl) : null
    ];

    return m('div.game_controls', controls);
  }

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
  resultDom.push(m('div.resultStatus', status));
  const buttons = ctrl.data.player.spectator ? [
    button.shareLink(ctrl),
    button.sharePGN(ctrl),
    ctrl.data.tv ? tvChannelSelector(ctrl) : null
  ] : [
    button.shareLink(ctrl),
    button.sharePGN(ctrl),
    button.newOpponent(ctrl),
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
          window.open(link, '_blank');
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

function renderGamePopup(ctrl) {
  return popupWidget(
    'player_controls',
    helper.isPortrait() ? gameInfos(ctrl.data) : null,
    gameApi.playable(ctrl.data) ?
      renderGameRunningActions.bind(undefined, ctrl) : renderGameEndedActions.bind(undefined, ctrl),
    ctrl.vm.showingActions,
    ctrl.hideActions
  );
}

function renderGameActionsBar(ctrl) {
  const answerRequired = ctrl.data.opponent.proposingTakeback ||
    ctrl.data.opponent.offeringDraw ||
    gameApi.forceResignable(ctrl.data) ||
    ctrl.data.opponent.offeringRematch;

  const prevPly = ctrl.vm.ply - 1;
  const nextPly = ctrl.vm.ply + 1;
  const bwdOn = ctrl.vm.ply !== prevPly && prevPly >= ctrl.firstPly();
  const fwdOn = ctrl.vm.ply !== nextPly && nextPly <= ctrl.lastPly();
  const hash = answerRequired + (!ctrl.chat || ctrl.chat.unread) + ctrl.vm.flip + bwdOn + fwdOn;

  if (ctrl.vm.buttonsHash === hash) return {
    subtree: 'retain'
  };
  ctrl.vm.buttonsHash = hash;

  const children = [
    m('button.action_bar_button.fa.fa-ellipsis-h', {
      key: 'gameMenu',
      className: helper.classSet({
        glow: answerRequired
      }),
      config: helper.ontouch(ctrl.showActions)
    }),
    ctrl.chat ? m('button.action_bar_button[data-icon=c]', {
      key: 'chat',
      className: helper.classSet({
        glow: ctrl.chat.unread
      }),
      config: helper.ontouch(ctrl.chat.open || utils.noop)
    }) : m('button.action_bar_button.empty[data-icon=c]'),
    button.flipBoard(ctrl),
    button.backward(ctrl),
    button.forward(ctrl)
  ];
  return m('section.actions_bar', {
    key: 'game-actions-bar'
  }, children);
}
