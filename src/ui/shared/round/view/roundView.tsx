import { Plugins } from '@capacitor/core'
import h from 'mithril/hyperscript'
import redraw from '../../../../utils/redraw'
import socket from '../../../../socket'
import session from '../../../../session'
import * as playerApi from '../../../../lichess/player'
import * as gameApi from '../../../../lichess/game'
import * as perfApi from '../../../../lichess/perfs'
import gameStatusApi from '../../../../lichess/status'
import { Player } from '../../../../lichess/interfaces/game'
import { User } from '../../../../lichess/interfaces/user'
import settings from '../../../../settings'
import * as utils from '../../../../utils'
import { emptyFen } from '../../../../utils/fen'
import i18n, { plural } from '../../../../i18n'
import layout from '../../../layout'
import * as helper from '../../../helper'
import { connectingHeader, backButton, menuButton, loader, headerBtns, bookmarkButton } from '../../../shared/common'
import PlayerPopup from '../../../shared/PlayerPopup'
import GameTitle from '../../../shared/GameTitle'
import CountdownTimer from '../../../shared/CountdownTimer'
import ViewOnlyBoard from '../../../shared/ViewOnlyBoard'
import Board from '../../../shared/Board'
import popupWidget from '../../../shared/popup'
import Clock from '../clock/clockView'
import promotion from '../promotion'
import gameButton from './button'
import { chatView } from '../../chat'
import { notesView } from '../notes'
import CrazyPocket from '../crazy/CrazyPocket'
import { view as renderCorrespondenceClock } from '../correspondenceClock/corresClockView'
import { renderInlineReplay, renderReplay } from './replay'
import OnlineRound from '../OnlineRound'
import { Position, Material } from '../'

export default function view(ctrl: OnlineRound) {
  const isPortrait = helper.isPortrait()

  return layout.board(
    renderHeader(ctrl),
    renderContent(ctrl, isPortrait),
    'round',
    overlay(ctrl),
    undefined,
    undefined,
    'roundView'
  )
}

export function renderMaterial(material: Material) {
  const tomb = Object.keys(material.pieces).map((role: string) =>
    h('div.tomb', Array.from(Array(material.pieces[role]).keys())
      .map(_ => h('piece', { className: role }))
    )
  )

  if (material.score > 0) {
    tomb.push(h('span', '+' + material.score))
  }

  return tomb
}

export function viewOnlyBoardContent(fen: string, orientation: Color, lastMove?: string, variant?: VariantKey, wrapperClass?: string, customPieceTheme?: string) {
  const isPortrait = helper.isPortrait()
  const vd = helper.viewportDim()
  const className = 'board_wrapper' + (wrapperClass ? ' ' + wrapperClass : '')
  const board = (
    <section className={className}>
      {h(ViewOnlyBoard, {fen, lastMove, orientation, variant, customPieceTheme})}
    </section>
  )
  const showMoveList = helper.hasSpaceForInlineReplay(vd, isPortrait) &&
    settings.game.moveList() &&
    !settings.game.zenMode()

  if (isPortrait) {
    return h.fragment({}, [
      showMoveList ? h('div.replay_inline') : null,
      h('section.playTable'),
      board,
      h('section.playTable'),
      h('section.actions_bar'),
    ])
  } else {
    return h.fragment({}, [
      board,
      h('section.table'),
    ])
  }
}

export const LoadingBoard = {
  view() {
    return layout.board(
      connectingHeader(),
      viewOnlyBoardContent(emptyFen, 'white'),
      'roundView'
    )
  }
}

function overlay(ctrl: OnlineRound) {
  let chatHeader = (!ctrl.data.opponent.user || ctrl.data.player.spectator) ? i18n('chat') : ctrl.data.opponent.user.username
  const watchers = ctrl.data.watchers
  if (ctrl.data.player.spectator && watchers && watchers.nb >= 2) {
    chatHeader = i18n('spectators') + ' ' + watchers.nb
  } else if (ctrl.data.player.spectator) {
    chatHeader = i18n('spectatorRoom')
  }
  return [
    ctrl.chat ? chatView(ctrl.chat, chatHeader) : null,
    ctrl.notes ? notesView(ctrl.notes) : null,
    promotion.view(ctrl),
    renderGamePopup(ctrl),
    renderSubmitMovePopup(ctrl),
    h(PlayerPopup, {
      player: ctrl.data.player,
      opponent: ctrl.data.opponent,
      mini: ctrl.vm.miniUser.player.data,
      score: ctrl.score,
      isOpen: ctrl.vm.miniUser.player.showing,
      close: () => ctrl.closeUserPopup('player'),
    }),
    h(PlayerPopup, {
      player: ctrl.data.opponent,
      opponent: ctrl.data.player,
      mini: ctrl.vm.miniUser.opponent.data,
      score: ctrl.score,
      isOpen: ctrl.vm.miniUser.opponent.showing,
      close: () => ctrl.closeUserPopup('opponent'),
    })
  ]
}

function renderTitle(ctrl: OnlineRound) {
  const data = ctrl.data
  const tournament = ctrl.data.tournament
  if (ctrl.vm.offlineWatcher || socket.isConnected()) {
    const isCorres = !data.player.spectator && data.game.speed === 'correspondence'
    if (ctrl.data.tv) {
      return h('div.main_header_title.withSub', [
        h('h1.header-gameTitle', [
          tvChannelSelector(ctrl)
        ]),
        h('h2.header-subTitle', gameApi.title(ctrl.data)),
      ])
    }
    else if (ctrl.data.userTV) {
      return h('div.main_header_title.withSub', [
        h('h1.header-gameTitle', [
          h('span.withIcon[data-icon=1]'), ctrl.data.userTV,
        ]),
        h('h2.header-subTitle', [
          h(`span.withIcon[data-icon=${utils.gameIcon(ctrl.data.game.perf)}]`),
          gameApi.title(ctrl.data),
        ].concat(tournament ? [
          ' • ',
          h('span.fa.fa-trophy'),
          h(CountdownTimer, { seconds: tournament.secondsToFinish || 0 }),
        ] : [])),
      ])
    }
    else {
      return h(GameTitle, {
        data: ctrl.data,
        kidMode: session.isKidMode(),
        subTitle: tournament ? 'tournament' : isCorres ? 'corres' : 'date'
      })
    }
  } else {
    return (
      <div className="main_header_title reconnecting">
        {loader}
      </div>
    )
  }
}

function renderHeader(ctrl: OnlineRound) {

  let children
  if (ctrl.goingBack || (!ctrl.data.tv && !ctrl.data.userTV && ctrl.data.player.spectator)) {
    children = [
      backButton([
        renderTitle(ctrl),
        bookmarkButton(ctrl.toggleBookmark, ctrl.data.bookmarked!),
      ])
    ]
  } else {
    children = [
      menuButton(),
      renderTitle(ctrl),
    ]
  }
  children.push(headerBtns())

  return h('nav', {
    key: 'roundHeader', // workaround to avoid mithril error
    className: socket.isConnected() ? '' : 'reconnecting'
  }, children)
}

function renderContent(ctrl: OnlineRound, isPortrait: boolean) {
  const vd = helper.viewportDim()

  const material = ctrl.chessground.getMaterialDiff()

  const player = renderPlayTable(ctrl, ctrl.data.player, material[ctrl.data.player.color], 'player')
  const opponent = renderPlayTable(ctrl, ctrl.data.opponent, material[ctrl.data.opponent.color], 'opponent')

  const playable = gameApi.playable(ctrl.data)
  const myTurn = gameApi.isPlayerTurn(ctrl.data)

  const board = h(Board, {
    variant: ctrl.data.game.variant.key,
    chessground: ctrl.chessground,
  }, playable ? [
    !myTurn ? renderExpiration(ctrl, 'opponent', myTurn) : null,
    myTurn ? renderExpiration(ctrl, 'player', myTurn) : null,
  ] : [])

  if (isPortrait) {
    return [
      helper.hasSpaceForInlineReplay(vd, isPortrait) ? renderInlineReplay(ctrl) : null,
      opponent,
      board,
      player,
      renderGameActionsBar(ctrl)
    ]
  } else {
    return [
      board,
      h('section.table', [
        opponent,
        renderReplay(ctrl),
        renderGameActionsBar(ctrl),
        player,
      ]),
    ]
  }
}

function renderExpiration(ctrl: OnlineRound, position: Position, myTurn: boolean) {
  const d = ctrl.data.expiration
  if (!d) return null
  const timeLeft = Math.max(0, d.movedAt - Date.now() + d.millisToMove)

  return h('div.round-expiration', {
    className: position,
  }, h(CountdownTimer, {
      seconds: Math.round(timeLeft / 1000),
      emergTime: myTurn ? 8 : undefined,
      textWrap: (sec: Seconds, t: string) => plural('nbSecondsToPlayTheFirstMove', sec, `<strong>${t}</<strong>`),
      showOnlySecs: true
    })
  )
}

function getChecksCount(ctrl: OnlineRound, color: Color) {
  const player = color === ctrl.data.player.color ? ctrl.data.opponent : ctrl.data.player
  return player.checks
}

function renderSubmitMovePopup(ctrl: OnlineRound) {
  if (ctrl.vm.moveToSubmit || ctrl.vm.dropToSubmit || ctrl.vm.submitFeedback) {
    return (
      <div className="overlay_popup_wrapper submitMovePopup">
        <div className="overlay_popup">
          {gameButton.submitMove(ctrl)}
        </div>
      </div>
    )
  }

  return null
}

function userInfos(user: User, player: Player, playerName: string) {
  let title: string
  if (user) {
    const onlineStatus = user.online ? 'connected to lichess' : 'offline'
    const onGameStatus = player.onGame ? 'currently on this game' : 'currently not on this game'
    title = `${playerName}: ${onlineStatus}; ${onGameStatus}`
  } else {
    title = playerName
  }
  Plugins.LiToast.show({ text: title, duration: 'short' })
}

function renderPlayerName(player: Player) {
  if (player.name || player.username || player.user) {
    const name = player.name || player.username || player.user?.username
    return h('span', [
      player.user?.title ? [
        h('span.userTitle' + (player.user?.title === 'BOT' ? '.bot' : ''), player.user.title),
        ' '
      ] : [],
      name
    ])
  }

  if (player.ai) return playerApi.aiName({ ai: player.ai })

  return 'Anonymous'
}

function renderAntagonistInfo(ctrl: OnlineRound, player: Player, material: Material, position: Position, isCrazy: boolean) {
  const user = player.user
  const playerName = renderPlayerName(player)
  const togglePopup = user ? () => ctrl.openUserPopup(position, user.id) : utils.noop
  const vConf = user ?
    helper.ontap(togglePopup, () => userInfos(user, player, playerApi.playerName(player))) :
    helper.ontap(utils.noop, () => Plugins.LiToast.show({ text: playerName, duration: 'short' }))

  const checksNb = getChecksCount(ctrl, player.color)

  const runningColor = ctrl.isClockRunning() ? ctrl.data.game.player : undefined

  const tournamentRank = ctrl.data.tournament && ctrl.data.tournament.ranks ?
    '#' + ctrl.data.tournament.ranks[player.color] + ' ' : null

  const isBerserk = ctrl.vm.goneBerserk[player.color]

  return (
    <div className={'antagonistInfos' + (isCrazy ? ' crazy' : '') + (ctrl.isZen() ? ' zen' : '')} oncreate={vConf}>
      <h2 className="antagonistUser">
        { user && user.patron ?
          <span className={'patron status ' + (player.onGame ? 'ongame' : 'offgame')} data-icon="" />
          :
          <span className={'fa fa-circle status ' + (player.onGame ? 'ongame' : 'offgame')} /> }
        {tournamentRank}
        {playerName}
        { isBerserk ? <span className="berserk" data-icon="`" /> : null }
        { isCrazy && position === 'opponent' && user && (user.tosViolation || user.booster) ?
          <span className="warning" data-icon="j"></span> : null
        }
      </h2>
      { !isCrazy ?
      <div className="ratingAndMaterial">
        { position === 'opponent' && user && (user.tosViolation || user.booster) ?
          <span className="warning" data-icon="j"></span> : null
        }
        {user ?
          <h3 className="rating">
            {player.rating}
            {player.provisional ? '?' : ''}
            {helper.renderRatingDiff(player)}
          </h3> : null
        }
        {checksNb !== undefined ?
          <div className="checkCount">+{checksNb}</div> : null
        }
        {!ctrl.vm.showCaptured || ctrl.data.game.variant.key === 'horde' ? null : renderMaterial(material)}
      </div> : null
      }
      {isCrazy && ctrl.clock ?
        h(Clock, {
          ctrl: ctrl.clock,
          color: player.color,
          isBerserk,
          runningColor
        }) :
        isCrazy && ctrl.correspondenceClock ?
          renderCorrespondenceClock(
            ctrl.correspondenceClock, player.color, ctrl.data.game.player
          ) : null
      }
    </div>
  )
}

function renderPlayTable(
  ctrl: OnlineRound,
  player: Player,
  material: Material,
  position: Position,
) {
  const runningColor = ctrl.isClockRunning() ? ctrl.data.game.player : undefined
  const step = ctrl.plyStep(ctrl.vm.ply)
  const isCrazy = !!step.crazy

  const classN = helper.classSet({
    playTable: true,
    crazy: isCrazy,
    clockOnLeft: ctrl.vm.clockPosition === 'left',
    flip: !ctrl.data.tv && ctrl.vm.flip,
  })

  return (
    <section className={classN + ' ' + position}>
      {renderAntagonistInfo(ctrl, player, material, position, isCrazy)}
      { step.crazy ?
        h(CrazyPocket, {
          ctrl,
          crazyData: step.crazy,
          color: player.color,
          position
        }) : null
      }
      { !isCrazy && ctrl.clock ?
        h(Clock, {
          ctrl: ctrl.clock,
          color: player.color,
          isBerserk: ctrl.vm.goneBerserk[player.color],
          runningColor
        }) :
        !isCrazy && ctrl.correspondenceClock ?
          renderCorrespondenceClock(
            ctrl.correspondenceClock, player.color, ctrl.data.game.player
          ) : null
      }
    </section>
  )
}

function tvChannelSelector(ctrl: OnlineRound) {
  const channels = perfApi.perfTypes.filter(e => e[0] !== 'correspondence').map(e => [e[1], e[0]])
  channels.unshift(['Top rated', 'best'])
  channels.push(['Bot', 'bot'])
  channels.push(['Computer', 'computer'])
  const channel = settings.tv.channel() as PerfKey
  const icon = utils.gameIcon(channel)

  return (
    h('div.select_input.main_header-selector.round-tvChannelSelector', [
      h('label', {
        'for': 'channel_selector'
      }, [
        h(`i[data-icon=${icon}]`),
        h('span', h.trust('&nbsp;')),
        h('span', 'Lichess TV')
      ]),
      h('select#channel_selector', {
        value: channel,
        onchange(e: Event) {
          const val = (e.target as HTMLSelectElement).value
          settings.tv.channel(val)
          ctrl.onFeatured && ctrl.onFeatured()
          setTimeout(redraw, 10)
        }
      }, channels.map(v =>
        h('option', {
          key: v[1], value: v[1]
        }, v[0])
      ))
    ])
  )
}

function renderGameRunningActions(ctrl: OnlineRound) {
  return h('div.gameControls', {
    key: 'gameRunningActions'
  }, ctrl.data.player.spectator ? [
    gameButton.shareLink(ctrl),
  ] : [
    gameButton.toggleZen(ctrl),
    gameButton.analysisBoard(ctrl),
    gameButton.moretime(ctrl),
    gameButton.standard(ctrl, gameApi.abortable, 'L', 'abortGame', 'abort'),
  ].concat(
    gameApi.forceResignable(ctrl.data) ? [gameButton.forceResign(ctrl)] : [
      gameButton.standard(ctrl, gameApi.takebackable, 'i', 'proposeATakeback', 'takeback-yes'),
      gameButton.cancelTakebackProposition(ctrl),
      gameButton.offerDraw(ctrl),
      gameButton.drawConfirmation(ctrl),
      gameButton.cancelDrawOffer(ctrl),
      gameButton.threefoldClaimDraw(ctrl),
      gameButton.resign(ctrl),
      gameButton.resignConfirmation(ctrl),
      gameButton.goBerserk(ctrl),
      gameButton.answerOpponentDrawOffer(ctrl),
      gameButton.answerOpponentTakebackProposition(ctrl),
    ]
  ))
}

function renderGameEndedActions(ctrl: OnlineRound) {
  let buttons: Mithril.Children
  const tournamentId = ctrl.data.game.tournamentId

  const shareActions = h('button', {
    oncreate: helper.ontap(ctrl.showShareActions),
  }, [h('span.fa.fa-share'), i18n('shareAndExport')])

  if (ctrl.vm.showingShareActions) {
    buttons = [
      gameButton.shareLink(ctrl),
      gameButton.sharePGN(ctrl),
    ]
  }
  else if (tournamentId) {
    if (ctrl.data.player.spectator) {
      buttons = [
        shareActions,
        gameButton.analysisBoard(ctrl),
        gameButton.returnToTournament(ctrl),
      ]
    }
    else {
      buttons = [
        shareActions,
        gameButton.analysisBoard(ctrl),
        gameButton.withdrawFromTournament(ctrl, tournamentId),
        gameButton.returnToTournament(ctrl),
      ]
    }
  }
  else {
    if (ctrl.data.player.spectator) {
      buttons = [
        shareActions,
        gameButton.analysisBoard(ctrl)
      ]
    }
    else {
      buttons = [
        shareActions,
        gameButton.analysisBoard(ctrl),
        gameButton.newOpponent(ctrl),
        gameButton.rematch(ctrl),
      ]
    }
  }
  return h('div.game_controls', { key: 'gameEndedActions' }, h.fragment({
    key: ctrl.vm.showingShareActions ? 'shareMenu' : 'menu'
  }, buttons))
}

function renderStatus(ctrl: OnlineRound) {
  const result = gameApi.result(ctrl.data)
  const winner = gameApi.getPlayer(ctrl.data, ctrl.data.game.winner)
  const status = gameStatusApi.toLabel(ctrl.data.game.status.name, ctrl.data.game.turns, ctrl.data.game.winner, ctrl.data.game.variant.key) +
    (winner ? '. ' + i18n(winner.color === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '')
  return (gameStatusApi.aborted(ctrl.data) ? [] : [
    h('strong', result), h('br')
  ]).concat([h('em.resultStatus', status)])
}

function renderGamePopup(ctrl: OnlineRound) {
  const header = !gameApi.playable(ctrl.data) ?
    () => renderStatus(ctrl) : undefined

  return popupWidget(
    'player_controls',
    ctrl.vm.showingShareActions ? undefined : header,
    () => gameApi.playable(ctrl.data) ?
      renderGameRunningActions(ctrl) :
      renderGameEndedActions(ctrl),
    ctrl.vm.showingActions,
    ctrl.hideActions
  )
}

function renderGameActionsBar(ctrl: OnlineRound) {
  const answerRequired = ((ctrl.data.opponent.proposingTakeback ||
    ctrl.data.opponent.offeringDraw) && !gameStatusApi.finished(ctrl.data)) ||
    gameApi.forceResignable(ctrl.data) ||
    ctrl.data.opponent.offeringRematch

  const gmClass = (ctrl.data.opponent.proposingTakeback ? [
    'fa',
    'fa-mail-reply'
  ] : [
    'fa',
    'fa-list'
  ]).concat([
    'action_bar_button',
    answerRequired ? 'glow' : ''
  ]).join(' ')

  const gmDataIcon = ctrl.data.opponent.offeringDraw ? '2' : null
  const gmButton = gmDataIcon ?
    <button className={gmClass} data-icon={gmDataIcon} oncreate={helper.ontap(ctrl.showActions)} /> :
    <button className={gmClass} oncreate={helper.ontap(ctrl.showActions)} />

  return (
    <section className="actions_bar">
      {gmButton}
      {ctrl.chat && !ctrl.isZen() ?
        <button className="action_bar_button fa fa-comments withChip"
          oncreate={helper.ontap(ctrl.chat.open)}
        >
         { ctrl.chat.nbUnread > 0 ?
          <span className="chip">
            { ctrl.chat.nbUnread <= 99 ? ctrl.chat.nbUnread : 99 }
          </span> : null
         }
        </button> : null
      }
      {ctrl.notes ? gameButton.notes(ctrl) : null}
      {gameButton.flipBoard(ctrl)}
      {gameApi.playable(ctrl.data) ? null : gameButton.analysisBoardIconOnly(ctrl)}
      {gameButton.backward(ctrl)}
      {gameButton.forward(ctrl)}
    </section>
  )
}
