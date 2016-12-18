import * as m from 'mithril';
import * as chessground from 'chessground-mobile';
import socket from '../../../../socket';
import session from '../../../../session';
import variantApi from '../../../../lichess/variant';
import * as gameApi from '../../../../lichess/game';
import { perfTypes } from '../../../../lichess/perfs';
import gameStatusApi from '../../../../lichess/status';
import settings from '../../../../settings';
import * as utils from '../../../../utils';
import i18n from '../../../../i18n';
import layout from '../../../layout';
import * as helper from '../../../helper';
import { gameTitle, backButton, menuButton, loader, headerBtns, miniUser } from '../../../shared/common';
import Board from '../../../shared/Board';
import popupWidget from '../../../shared/popup';
import formWidgets from '../../../shared/form';
import Clock, { ClockAttrs } from '../clock/clockView';
import promotion from '../promotion';
import gameButton from './button';
import { chatView } from '../chat';
import { notesView } from '../notes';
import CrazyPocket, { Attrs as CrazyPocketAttrs } from '../crazy/CrazyPocket';
import { view as renderCorrespondenceClock } from '../correspondenceClock/corresClockView';
import { renderTable as renderReplayTable } from './replay';
import OnlineRound from '../OnlineRound';
import { Position, Material } from '../';

export default function view(ctrl: OnlineRound) {
  const isPortrait = helper.isPortrait();

  return layout.board(
    () => renderHeader(ctrl),
    () => renderContent(ctrl, isPortrait),
    () => overlay(ctrl, isPortrait)
  );
}

function overlay(ctrl: OnlineRound, isPortrait: boolean) {
  return [
    ctrl.chat ? chatView(ctrl.chat) : null,
    ctrl.notes ? notesView(ctrl.notes) : null,
    promotion.view(ctrl),
    renderGamePopup(ctrl, isPortrait),
    renderSubmitMovePopup(ctrl),
    miniUser(ctrl.data.player.user, ctrl.vm.miniUser.player.data, ctrl.vm.miniUser.player.showing, () => ctrl.closeUserPopup('player')),
    miniUser(ctrl.data.opponent.user, ctrl.vm.miniUser.opponent.data, ctrl.vm.miniUser.opponent.showing, () => ctrl.closeUserPopup('opponent'))
  ];
}

export function renderMaterial(material: Material) {
  const children: Mithril.Children = [];
  for (let role in material) {
    const piece = <div className={role} />;
    const count = material[role];
    const content: Array<Mithril.ChildNode> = [];
    for (let i = 0; i < count; i++) content.push(piece);
    children.push(<div className="tomb" key={role}>{content}</div>);
  }
  return children;
}

function renderTitle(ctrl: OnlineRound) {
  function tcConfig(vnode: Mithril.ChildNode) {
    const el = vnode.dom as HTMLElement;
    el.textContent =
      utils.formatTimeInSecs(ctrl.data.tournament.secondsToFinish) +
      ' • ';
    ctrl.vm.tClockEl = el;
  }
  if (ctrl.vm.offlineWatcher || socket.isConnected()) {
    return (
      <h1 key="playingTitle" className="playing">
        { session.isKidMode() ? <span className="kiddo">😊</span> : null }
        {ctrl.data.userTV ? <span className="withIcon" data-icon="1" /> : null}
        {ctrl.data.tournament ?
          <span className="fa fa-trophy" /> : null
        }
        {ctrl.data.tournament && ctrl.data.tournament.secondsToFinish ?
          <span oncreate={tcConfig}>
          {
            utils.formatTimeInSecs(ctrl.data.tournament.secondsToFinish) +
            ' • '
          }
          </span> : null
        }
        {ctrl.title}
        { ctrl.vm.offlineWatcher ? ' • Offline' : null}
      </h1>
    );
  } else {
    return (
      <h1 key="reconnectingTitle" className="reconnecting">
        {loader}
      </h1>
    );
  }
}

function renderHeader(ctrl: OnlineRound) {
  return (
    <nav className={socket.isConnected() ? '' : 'reconnecting'}>
      { !ctrl.data.tv && !ctrl.data.userTV && ctrl.data.player.spectator ? backButton(gameTitle(ctrl.data)) : menuButton()}
      { ctrl.data.tv || ctrl.data.userTV || !ctrl.data.player.spectator ? renderTitle(ctrl) : null}
      {headerBtns()}
    </nav>
  );
}

function renderContent(ctrl: OnlineRound, isPortrait: boolean) {
  const material = chessground.board.getMaterialDiff(ctrl.chessground.data);
  const player = renderPlayTable(ctrl, ctrl.data.player, material[ctrl.data.player.color], 'player', isPortrait);
  const opponent = renderPlayTable(ctrl, ctrl.data.opponent, material[ctrl.data.opponent.color], 'opponent', isPortrait);
  const bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait, 'game');

  const board = m(Board, {
    data: ctrl.data,
    chessgroundCtrl: ctrl.chessground,
    bounds,
    isPortrait,
    alert: gameApi.mandatory(ctrl.data) && !ctrl.data.player.spectator && gameApi.nbMoves(ctrl.data, ctrl.data.player.color) === 0 ?
      i18n('youHaveNbSecondsToMakeYourFirstMove', ctrl.data.tournament.nbSecondsForFirstMove) : null
  });

  const orientationKey = isPortrait ? 'o-portrait' : 'o-landscape';

  if (isPortrait) {
    return m.fragment({ key: orientationKey }, [
      opponent,
      board,
      player,
      renderGameActionsBar(ctrl)
    ]);
  } else {
    return m.fragment({ key: orientationKey }, [
      board,
      <section className="table">
        <header className="tableHeader">
          {gameInfos(ctrl)}
        </header>
        <section className="playersTable">
          {opponent}
          {renderReplayTable(ctrl)}
          {player}
        </section>
        {renderGameActionsBar(ctrl)}
      </section>
    ]);
  }
}

function getChecksCount(ctrl: OnlineRound, color: Color) {
  const player = color === ctrl.data.player.color ? ctrl.data.opponent : ctrl.data.player;
  return player.checks;
}

function renderSubmitMovePopup(ctrl: OnlineRound) {
  if (ctrl.vm.moveToSubmit || ctrl.vm.dropToSubmit) {
    return (
      <div className="overlay_popup_wrapper submitMovePopup">
      <div className="overlay_popup">
      {gameButton.submitMove(ctrl)}
      </div>
      </div>
    );
  }

  return null;
}

function userInfos(user: User, player: Player, playerName: string, position: Position) {
  let title: string;
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

function renderAntagonistInfo(ctrl: OnlineRound, player: Player, material: Material, position: Position, isPortrait: boolean, isCrazy: boolean) {
  const user = player.user;
  const playerName = utils.playerName(player, !isPortrait);
  const togglePopup = user ? () => ctrl.openUserPopup(position, user.id) : utils.noop;
  const vConf = user ?
    helper.ontap(togglePopup, () => userInfos(user, player, playerName, position)) :
    helper.ontap(utils.noop, () => window.plugins.toast.show(playerName, 'short', 'center'));

  const checksNb = getChecksCount(ctrl, player.color);

  const runningColor = ctrl.isClockRunning() ? ctrl.data.game.player : null;

  const tournamentRank = ctrl.data.tournament && ctrl.data.tournament.ranks ?
    '#' + ctrl.data.tournament.ranks[player.color] + ' ' : null;

  return (
    <div className={'antagonistInfos' + (isCrazy ? ' crazy' : '')} oncreate={vConf}>
      <h2 className="antagonistUser">
        <span className={'fa fa-circle status ' + (player.onGame ? 'ongame' : 'offgame')} />
        {tournamentRank}
        {playerName}
        { isCrazy && position === 'opponent' && user && (user.engine || user.booster) ?
          <span className="warning" data-icon="j"></span> : null
        }
      </h2>
      { !isCrazy ?
      <div className="ratingAndMaterial">
        { position === 'opponent' && user && (user.engine || user.booster) ?
          <span className="warning" data-icon="j"></span> : null
        }
        {user && isPortrait ?
          <h3 className="rating">
            {player.rating}
            {player.provisional ? '?' : ''}
            {helper.renderRatingDiff(player)}
          </h3> : null
        }
        {checksNb !== undefined ?
          <div className="checkCount">{checksNb}</div> : null
        }
        {ctrl.data.game.variant.key === 'horde' ? null : renderMaterial(material)}
      </div> : null
      }
      {isCrazy && ctrl.clock ?
        m(Clock, { ctrl: ctrl.clock, color: player.color, runningColor, isBerserk: ctrl.vm.goneBerserk[player.color] }) : (
        isCrazy && ctrl.correspondenceClock ?
          renderCorrespondenceClock(
            ctrl.correspondenceClock, player.color, ctrl.data.game.player
          ) : null
        )
      }
    </div>
  );
}

function renderPlayTable(ctrl: OnlineRound, player: Player, material: Material, position: Position, isPortrait: boolean) {
  const runningColor = ctrl.isClockRunning() ? ctrl.data.game.player : null;
  const step = ctrl.plyStep(ctrl.vm.ply);
  const isCrazy = !!step.crazy;

  return (
    <section className={'playTable' + (isCrazy ? ' crazy' : '')}>
      {renderAntagonistInfo(ctrl, player, material, position, isPortrait, isCrazy)}
      {m<CrazyPocketAttrs>(CrazyPocket, {
        ctrl,
        crazyData: step.crazy,
        color: player.color,
        position
      })}
      {!isCrazy && ctrl.clock ?
        m<ClockAttrs>(Clock, { ctrl: ctrl.clock, color: player.color, runningColor, isBerserk: ctrl.vm.goneBerserk[player.color] }) : (
        !isCrazy && ctrl.correspondenceClock ?
          renderCorrespondenceClock(
            ctrl.correspondenceClock, player.color, ctrl.data.game.player
          ) : null
        )
      }
    </section>
  );
}

function tvChannelSelector(ctrl: OnlineRound) {
  const channels = perfTypes.filter(e => e[0] !== 'correspondence').map(e => [e[1], e[0]]);
  channels.unshift(['Top rated', 'best']);
  channels.push(['Computer', 'computer']);

  return m('div.action', m('div.select_input',
    formWidgets.renderSelect('TV channel', 'tvChannel', channels, settings.tv.channel,
      false, ctrl.onTVChannelChange)
  ));
}

function renderGameRunningActions(ctrl: OnlineRound) {
  if (ctrl.data.player.spectator) {
    let controls = [
      gameButton.shareLink(ctrl),
      ctrl.data.tv && ctrl.data.player.user ? gameButton.userTVLink(ctrl.data.player.user) : null,
      ctrl.data.tv && ctrl.data.player.user ? gameButton.userTVLink(ctrl.data.opponent.user) : null,
      ctrl.data.tv ? tvChannelSelector(ctrl) : null
    ];

    return <div className="game_controls">{controls}</div>;
  }

  const answerButtons = [
    gameButton.cancelDrawOffer(ctrl),
    gameButton.answerOpponentDrawOffer(ctrl),
    gameButton.cancelTakebackProposition(ctrl),
    gameButton.answerOpponentTakebackProposition(ctrl)
  ];

  const gameControls = gameButton.forceResign(ctrl) || [
    gameButton.standard(ctrl, gameApi.takebackable, 'i', 'proposeATakeback', 'takeback-yes'),
    gameButton.standard(ctrl, gameApi.drawable, '2', 'offerDraw', 'draw-yes'),
    gameButton.threefoldClaimDraw(ctrl),
    gameButton.resign(ctrl),
    gameButton.resignConfirmation(ctrl),
    gameButton.goBerserk(ctrl)
  ];

  return (
    <div className="game_controls">
      {gameButton.analysisBoard(ctrl)}
      {gameButton.shareLink(ctrl)}
      {gameButton.moretime(ctrl)}
      {gameButton.standard(ctrl, gameApi.abortable, 'L', 'abortGame', 'abort')}
      {gameControls}
      {answerButtons ? <div className="answers">{answerButtons}</div> : null}
    </div>
  );
}

function renderGameEndedActions(ctrl: OnlineRound) {
  const result = gameApi.result(ctrl.data);
  const winner = gameApi.getPlayer(ctrl.data, ctrl.data.game.winner);
  const status = gameStatusApi.toLabel(ctrl.data.game.status.name, ctrl.data.game.winner, ctrl.data.game.variant.key) +
    (winner ? '. ' + i18n(winner.color === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '');
  const resultDom = gameStatusApi.aborted(ctrl.data) ? [] : [
    m('strong', result), m('br')
  ];
  resultDom.push(m('em.resultStatus', status));
  let buttons: Mithril.Children;
  if (ctrl.data.game.tournamentId) {
    if (ctrl.data.player.spectator) {
      buttons = [
        gameButton.returnToTournament(ctrl),
        gameButton.shareLink(ctrl),
        gameButton.sharePGN(ctrl),
        gameButton.analysisBoard(ctrl)
      ];
    }
    else {
      buttons = [
        gameButton.returnToTournament(ctrl),
        gameButton.withdrawFromTournament(ctrl),
        gameButton.shareLink(ctrl),
        gameButton.sharePGN(ctrl),
        gameButton.analysisBoard(ctrl)
      ];
    }
  }
  else {
    if (ctrl.data.player.spectator) {
      buttons = [
        gameButton.shareLink(ctrl),
        ctrl.data.tv && ctrl.data.player.user ? gameButton.userTVLink(ctrl.data.player.user) : null,
        ctrl.data.tv && ctrl.data.player.user ? gameButton.userTVLink(ctrl.data.opponent.user) : null,
        gameButton.sharePGN(ctrl),
        gameButton.analysisBoard(ctrl),
        ctrl.data.tv ? tvChannelSelector(ctrl) : null
      ];
    }
    else {
      buttons = [
        gameButton.shareLink(ctrl),
        gameButton.sharePGN(ctrl),
        gameButton.newOpponent(ctrl),
        gameButton.answerOpponentRematch(ctrl),
        gameButton.cancelRematch(ctrl),
        gameButton.rematch(ctrl),
        gameButton.analysisBoard(ctrl)
      ];
    }
  }
  return (
    <div className="game_controls">
      <div className="result">{resultDom}</div>
      <div className="control buttons">{buttons}</div>
    </div>
  );
}

function gameInfos(ctrl: OnlineRound) {
  const data = ctrl.data;
  const time = gameApi.time(data);
  const mode = data.game.rated ? i18n('rated') : i18n('casual');
  const icon = utils.gameIcon(data.game.perf);
  const variant = m('span.variant', {
    oncreate: helper.ontap(
      () => {
        const link = variantApi(data.game.variant.key).link;
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
      oncreate: helper.ontap(
        ctrl.toggleBookmark,
        () => window.plugins.toast.show(i18n('bookmarkThisGame'), 'short', 'center')
      ),
      'data-icon': data.bookmarked ? 't' : 's'
    }) : null
  ];
}

function renderGamePopup(ctrl: OnlineRound, isPortrait: boolean) {
  return popupWidget(
    'player_controls',
    isPortrait ? () => gameInfos(ctrl) : null,
    gameApi.playable(ctrl.data) ?
      () => renderGameRunningActions(ctrl) : () => renderGameEndedActions(ctrl),
    ctrl.vm.showingActions,
    ctrl.hideActions
  );
}

function renderGameActionsBar(ctrl: OnlineRound) {
  const answerRequired = ctrl.data.opponent.proposingTakeback ||
    ctrl.data.opponent.offeringDraw ||
    gameApi.forceResignable(ctrl.data) ||
    ctrl.data.opponent.offeringRematch;

  const gmClass = (ctrl.data.opponent.proposingTakeback ? [
    'fa',
    'fa-mail-reply'
  ] : [
    'fa',
    'fa-ellipsis-h'
  ]).concat([
    'action_bar_button',
    answerRequired ? 'glow' : ''
  ]).join(' ');

  const gmDataIcon = ctrl.data.opponent.offeringDraw ? '2' : null;
  const gmButton = gmDataIcon ?
    <button className={gmClass} data-icon={gmDataIcon} key="gameMenu" oncreate={helper.ontap(ctrl.showActions)} /> :
    <button className={gmClass} key="gameMenu" oncreate={helper.ontap(ctrl.showActions)} />;

  const chatClass = [
    'action_bar_button',
    ctrl.chat && ctrl.chat.unread ? 'glow' : ''
  ].join(' ');

  return (
    <section className="actions_bar">
      {gmButton}
      {ctrl.chat ?
      <button className={chatClass} data-icon="c" key="chat"
        oncreate={helper.ontap(ctrl.chat.open)} /> : null
      }
      {ctrl.notes ? gameButton.notes(ctrl) : null}
      {gameButton.flipBoard(ctrl)}
      {gameApi.playable(ctrl.data) ? null : gameButton.analysisBoardIconOnly(ctrl)}
      {gameApi.playable(ctrl.data) ? gameButton.first(ctrl) : null}
      {gameButton.backward(ctrl)}
      {gameButton.forward(ctrl)}
      {gameApi.playable(ctrl.data) ? gameButton.last(ctrl) : null}
    </section>
  );
}
