import m from 'mithril';
import socket from '../../../socket';
import session from '../../../session';
import challengesApi from '../../../lichess/challenges';
import friendsApi from '../../../lichess/friends';
import variantApi from '../../../lichess/variant';
import chessground from 'chessground-mobile';
import settings from '../../../settings';
import * as utils from '../../../utils';
import i18n from '../../../i18n';
import layout from '../../layout';
import { backButton, menuButton, loader, headerBtns } from '../../shared/common';
import popupWidget from '../../shared/popup';
import formWidgets from '../../shared/form';
import { view as renderClock } from '../clock/clockView';
import { view as renderPromotion } from '../promotion';
import helper from '../../helper';
import button from './button';
import gameApi from '../../../lichess/game';
import { perfTypes } from '../../../lichess/perfs';
import gameStatusApi from '../../../lichess/status';
import { view as renderChat } from '../chat';
import { view as renderNotes } from '../notes';
import { view as renderCorrespondenceClock } from '../correspondenceClock/correspondenceView';
import { renderTable as renderReplayTable } from './replay';

export default function view(ctrl) {

  const isPortrait = helper.isPortrait();

  return layout.board(
    () => renderHeader(ctrl),
    () => renderContent(ctrl, isPortrait),
    () => overlay(ctrl, isPortrait)
  );
}

function overlay(ctrl, isPortrait) {
  return [
    ctrl.chat ? renderChat(ctrl.chat) : null,
    ctrl.notes ? renderNotes(ctrl.notes) : null,
    renderPromotion(ctrl),
    renderGamePopup(ctrl, isPortrait),
    renderSubmitMovePopup(ctrl)
  ];
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

var boardTheme;
var pieceTheme;
export function onBoardThemeChange(t) {
  boardTheme = t;
}
export function onPieceThemeChange(t) {
  pieceTheme = t;
}

export function renderBoard(variant, chessgroundCtrl, isPortrait, moreWrapperClasses, customPieceTheme) {
  boardTheme = boardTheme || settings.general.theme.board();
  pieceTheme = pieceTheme || settings.general.theme.piece();
  const boardClass = [
    'display_board',
    boardTheme,
    customPieceTheme || pieceTheme,
    variant
  ].join(' ');
  let wrapperClass = 'game_board_wrapper';
  let key = 'board' + (isPortrait ? 'portrait' : 'landscape');

  if (moreWrapperClasses) {
    wrapperClass += ' ';
    wrapperClass += moreWrapperClasses;
  }

  function boardConfig(el, isUpdate) {
    if (!isUpdate) {
      chessground.render(el, chessgroundCtrl);
    }
  }

  return (
    <section className={wrapperClass} key={key}>
      <div className={boardClass} config={boardConfig} />
    </section>
  );
}

function renderVsButton(ctrl) {

  const text = utils.playerName(ctrl.data.player) + ' vs. ' +
    utils.playerName(ctrl.data.opponent);

  return backButton(text);
}

function renderTitle(ctrl) {
  if (socket.isConnected()) {
    return (
      <h1 className="playing">
        {ctrl.data.userTV ? <span className="withIcon" data-icon="1" /> : null}
        {ctrl.title}
      </h1>
    );
  } else if (utils.hasNetwork()) {
    return (
      <h1 className="reconnecting withTitle">
        {i18n('reconnecting')}
        {loader}
      </h1>
    );
  } else {
    return <h1>Offline</h1>;
  }
}

function renderHeader(ctrl) {
  const hash = '' + utils.hasNetwork() + session.isConnected() + socket.isConnected() +
    friendsApi.count() + challengesApi.incoming().length + session.nowPlaying().length +
    session.myTurnGames().length + ctrl.data.tv + ctrl.data.player.spectator;

  if (ctrl.vm.headerHash === hash) return {
    subtree: 'retain'
  };
  ctrl.vm.headerHash = hash;

  return (
    <nav className={socket.isConnected() ? '' : 'reconnecting'}>
      { !ctrl.data.tv && ctrl.data.player.spectator ? renderVsButton(ctrl) : menuButton()}
      { ctrl.data.tv || !ctrl.data.player.spectator ? renderTitle(ctrl) : null}
      {headerBtns()}
    </nav>
  );
}

function renderContent(ctrl, isPortrait) {
  const material = chessground.board.getMaterialDiff(ctrl.chessground.data);
  const player = renderPlayTable(ctrl, ctrl.data.player, material[ctrl.data.player.color], 'player', isPortrait);
  const opponent = renderPlayTable(ctrl, ctrl.data.opponent, material[ctrl.data.opponent.color], 'opponent', isPortrait);

  if (isPortrait)
    return [
      opponent,
      renderBoard(ctrl.data.game.variant.key, ctrl.chessground, isPortrait),
      player,
      renderGameActionsBar(ctrl, isPortrait)
    ];
  else
    return [
      renderBoard(ctrl.data.game.variant.key, ctrl.chessground, isPortrait),
      <section key="table" className="table">
        <header key="table-header" className="tableHeader">
          {gameInfos(ctrl)}
        </header>
        <section key="players-table" className="playersTable">
          {opponent}
          {renderReplayTable(ctrl)}
          {player}
        </section>
        {renderGameActionsBar(ctrl, isPortrait)}
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

function renderRatingDiff(player) {
  if (typeof player.ratingDiff === 'undefined') return null;
  if (player.ratingDiff === 0) return m('span.rp.null', ' +0');
  if (player.ratingDiff > 0) return m('span.rp.up', ' +' + player.ratingDiff);
  if (player.ratingDiff < 0) return m('span.rp.down', ' ' + player.ratingDiff);
}

function getChecksCount(ctrl, color) {
  const player = color === ctrl.data.player.color ? ctrl.data.opponent : ctrl.data.player;
  return player.checks;
}

function renderSubmitMovePopup(ctrl) {
  if (!ctrl.vm.moveToSubmit) return null;

  return (
    <div className="overlay_popup_wrapper submitMovePopup">
      <div className="overlay_popup">
        {button.submitMove(ctrl)}
      </div>
    </div>
  );
}

function userInfos(user, player, playerName, position) {
  let title;
  if (user) {
    let onlineStatus = user.online ? 'connected to lichess' : 'offline';
    let onGameStatus = player.onGame ? 'currently on this game' : 'currently not on this game';
    let engine = position === 'opponent' && user.engine ? i18n('thisPlayerUsesChessComputerAssistance') + '; ' : '';
    let booster = position === 'opponent' && user.booster ? i18n('thisPlayerArtificiallyIncreasesTheirRating') + '; ' : '';
    title = `${playerName}: ${engine}${booster}${onlineStatus}; ${onGameStatus}`;
  } else
    title = playerName;
  window.plugins.toast.show(title, 'short', 'center');
}

function renderAntagonistInfo(ctrl, player, material, position, isPortrait) {
  const vmKey = position + 'Hash';
  const user = player.user;
  const playerName = utils.playerName(player, !isPortrait);
  const vConf = user ?
    helper.ontouch(utils.f(m.route, '/@/' + user.id), () => userInfos(user, player, playerName, position)) :
    utils.noop;

  const onlineStatus = user && user.online ? 'online' : 'offline';
  const checksNb = getChecksCount(ctrl, player.color);

  const hash = ctrl.data.game.id + playerName + onlineStatus + player.onGame + player.rating + player.provisional + player.ratingDiff + checksNb + Object.keys(material).map(k => k + material[k]).join('') + isPortrait;

  if (ctrl.vm[vmKey] === hash) return {
    subtree: 'retain'
  };
  ctrl.vm[vmKey] = hash;

  return (
    <div className="antagonistInfos" config={vConf}>
      <h2 className="antagonistUser">
        {user ?
          <span className={'status ' + onlineStatus} data-icon="r" /> :
          null
        }
        {playerName}
        {player.onGame ?
          <span className="ongame yes" data-icon="3" /> :
          <span className="ongame no" data-icon="0" />
        }
      </h2>
      <div className="ratingAndMaterial">
        { position === 'opponent' && user && (user.engine || user.booster) ?
          <span className="warning" data-icon="j"></span> : null
        }
        {user && isPortrait ?
          <h3 className="rating">
            {player.rating}
            {player.provisional ? '?' : ''}
            {renderRatingDiff(player)}
          </h3> : null
        }
        {checksNb !== undefined ?
          <div className="checkCount">{checksNb}</div> : null
        }
        {ctrl.data.game.variant.key === 'horde' ? null : renderMaterial(material)}
      </div>
    </div>
  );
}

function renderPlayTable(ctrl, player, material, position, isPortrait) {
  const runningColor = ctrl.isClockRunning() ? ctrl.data.game.player : null;
  const key = 'player' + position + (isPortrait ? 'portrait' : 'landscape');

  return (
    <section className="playTable" key={key}>
      {renderAntagonistInfo(ctrl, player, material, position, isPortrait)}
      {ctrl.clock ?
        renderClock(ctrl.clock, player.color, runningColor) : (
        ctrl.correspondenceClock ?
          renderCorrespondenceClock(
            ctrl.correspondenceClock, player.color, ctrl.data.game.player
          ) : null
        )
      }
    </section>
  );
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

    return <div className="game_controls">{controls}</div>;
  }

  const d = ctrl.data;
  const answerButtons = compact([
    button.cancelDrawOffer(ctrl),
    button.answerOpponentDrawOffer(ctrl),
    button.cancelTakebackProposition(ctrl),
    button.answerOpponentTakebackProposition(ctrl),
    (gameApi.mandatory(d) && gameApi.nbMoves(d, d.player.color) === 0) ? m('div.text[data-icon=j]',
      i18n('youHaveNbSecondsToMakeYourFirstMove', 30)
    ) : undefined
  ]);

  const gameControls = button.forceResign(ctrl) || [
    button.standard(ctrl, gameApi.takebackable, 'i', 'proposeATakeback', 'takeback-yes'),
    button.standard(ctrl, gameApi.drawable, '2', 'offerDraw', 'draw-yes'),
    button.standard(ctrl, gameApi.resignable, 'b', 'resign', 'resign'),
    button.threefoldClaimDraw(ctrl)
  ];

  return (
    <div className="game_controls">
      {button.analysisBoard(ctrl)}
      {button.shareLink(ctrl)}
      {button.moretime(ctrl)}
      {button.standard(ctrl, gameApi.abortable, 'L', 'abortGame', 'abort')}
      {gameControls}
      {answerButtons ? <div className="answers">{answerButtons}</div> : null}
    </div>
  );
}

function renderGameEndedActions(ctrl) {
  const result = gameApi.result(ctrl.data);
  const winner = gameApi.getPlayer(ctrl.data, ctrl.data.game.winner);
  const status = gameStatusApi.toLabel(ctrl.data.game.status.name, ctrl.data.game.winner, ctrl.data.game.variant.key) +
    (winner ? '. ' + i18n(winner.color === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '');
  const resultDom = gameStatusApi.aborted(ctrl.data) ? [] : [
    m('strong', result), m('br')
  ];
  resultDom.push(m('em.resultStatus', status));
  const buttons = ctrl.data.player.spectator ? [
    button.shareLink(ctrl),
    button.sharePGN(ctrl),
    button.analysisBoard(ctrl),
    ctrl.data.tv ? tvChannelSelector(ctrl) : null
  ] : [
    button.shareLink(ctrl),
    button.sharePGN(ctrl),
    button.newOpponent(ctrl),
    button.answerOpponentRematch(ctrl),
    button.cancelRematch(ctrl),
    button.rematch(ctrl),
    button.analysisBoard(ctrl)
  ];

  return (
    <div className="game_controls">
      <div className="result">{resultDom}</div>
      <div className="control buttons">{buttons}</div>
    </div>
  );
}

function gameInfos(ctrl) {
  const data = ctrl.data;
  const time = gameApi.time(data);
  const mode = data.game.rated ? i18n('rated') : i18n('casual');
  const icon = data.opponent.ai ? ':' : utils.gameIcon(data.game.perf);
  const variant = m('span.variant', {
    config: helper.ontouch(
      () => {
        var link = variantApi(data.game.variant.key).link;
        if (link)
          window.open(link, '_blank');
      },
      () => window.plugins.toast.show(data.game.variant.title, 'short', 'center')
    )
  }, data.game.variant.name);
  const infos = [time + ' • ', variant, m('br'), mode];
  return [
    m('div.icon-game', {
      'data-icon': icon ? icon : ''
    }),
    m('div.game-title.no_select', infos),
    session.isConnected() ? m('button.star', {
      config: helper.ontouch(
        ctrl.toggleBookmark,
        () => window.plugins.toast.show(i18n('bookmarkThisGame'), 'short', 'center')
      ),
      'data-icon': data.bookmarked ? 't' : 's'
    }) : null
  ];
}

function renderGamePopup(ctrl, isPortrait) {
  return popupWidget(
    'player_controls',
    isPortrait ? () => gameInfos(ctrl) : null,
    gameApi.playable(ctrl.data) ?
      () => renderGameRunningActions(ctrl) : () => renderGameEndedActions(ctrl),
    ctrl.vm.showingActions,
    ctrl.hideActions
  );
}

function renderGameActionsBar(ctrl, isPortrait) {
  const answerRequired = ctrl.data.opponent.proposingTakeback ||
    ctrl.data.opponent.offeringDraw ||
    gameApi.forceResignable(ctrl.data) ||
    ctrl.data.opponent.offeringRematch;

  const prevPly = ctrl.vm.ply - 1;
  const nextPly = ctrl.vm.ply + 1;
  const bwdOn = ctrl.vm.ply !== prevPly && prevPly >= ctrl.firstPly();
  const fwdOn = ctrl.vm.ply !== nextPly && nextPly <= ctrl.lastPly();
  const hash = ctrl.data.game.id + answerRequired + (!ctrl.chat || ctrl.chat.unread) + ctrl.vm.flip + bwdOn + fwdOn + isPortrait;

  if (ctrl.vm.buttonsHash === hash) return {
    subtree: 'retain'
  };
  ctrl.vm.buttonsHash = hash;

  const gmClass = [
    'action_bar_button',
    'fa',
    'fa-ellipsis-h',
    answerRequired ? 'glow' : ''
  ].join(' ');

  const chatClass = [
    'action_bar_button',
    ctrl.chat && ctrl.chat.unread ? 'glow' : ''
  ].join(' ');

  return (
    <section className="actions_bar" key="game-actions-bar">
      <button className={gmClass} key="gameMenu" config={helper.ontouch(ctrl.showActions)} />
      {ctrl.chat ?
      <button className={chatClass} data-icon="c" key="chat" config={helper.ontouch(ctrl.chat.open || utils.noop)} /> : <button className="action_bar_button empty" />
      }
      {ctrl.notes ? button.notes(ctrl) : null}
      {button.flipBoard(ctrl)}
      {button.first(ctrl)}
      {button.backward(ctrl)}
      {button.forward(ctrl)}
      {button.last(ctrl)}
    </section>
  );
}
