import * as h from 'mithril/hyperscript'
import * as range from 'lodash/range'
import * as Siema from 'siema'
import * as utils from '../utils'
import redraw from '../utils/redraw'
import { positionsCache } from '../utils/gamePosition'
import { getOfflineGames } from '../utils/offlineGames'
import { playerName as liPlayerName } from '../lichess/player'
import { OnlineGameData } from '../lichess/interfaces/game'
import { NowPlayingGame } from '../lichess/interfaces'
import { Challenge } from '../lichess/interfaces/challenge'
import * as gameApi from '../lichess/game'
import challengesApi from '../lichess/challenges'
import { standardFen } from '../lichess/variant'
import router from '../router'
import session from '../session'
import i18n from '../i18n'
import * as xhr from '../xhr'
import * as helper from './helper'
import newGameForm from './newGameForm'
import ViewOnlyBoard from './shared/ViewOnlyBoard'

let scroller: any | null = null

let isOpen = false
let lastJoined: NowPlayingGame | undefined

export interface GamesMenu {
  lastJoined(): NowPlayingGame | undefined
  resetLastJoined(): void
  open(): void
  close(fromBB?: string): void
  view(): Mithril.Child
}

export default {
  lastJoined() {
    return lastJoined
  },
  resetLastJoined() {
    lastJoined = undefined
  },
  open,
  close,
  view() {
    if (!isOpen) return null

    return h('div#games_menu.overlay_popup_wrapper', {
      onbeforeremove: menuOnBeforeRemove
    }, [
      h('div.wrapper_overlay_close', { oncreate: menuOnOverlayTap }),
      renderCarouselIndicators(),
      h('div#wrapper_games', renderAllGames()),
    ])
  }
}

const menuOnOverlayTap = helper.ontap(() => close())

function menuOnBeforeRemove({ dom }: Mithril.DOMNode) {
  dom.classList.add('fading_out')
  return new Promise((resolve) => {
    setTimeout(resolve, 500)
  })
}

function wrapperOnCreate({ dom }: Mithril.DOMNode) {
  if (helper.isPortrait()) {
    scroller = new Siema({
      selector: dom as HTMLElement,
      duration: 150,
      easing: 'ease-out',
      perPage: helper.isWideScreen() ? 2 : 1,
      startIndex: 0,
      draggable: true,
      onChange: () => redraw(),
    })
    redraw()
  }
}

function wrapperOnRemove() {
  if (scroller) {
    scroller.destroy()
    scroller = null
  }
}

function open() {
  router.backbutton.stack.push(close)
  session.refresh()
  isOpen = true
  setTimeout(() => {
    if (scroller && !helper.isWideScreen()) scroller.goTo(1)
  }, 400)
}

function close(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
  isOpen = false
}


function joinGame(g: NowPlayingGame) {
  lastJoined = g
  positionsCache.set(g.fullId, { fen: g.fen, orientation: g.color })
  close()
  router.set('/game/' + g.fullId)
}

function acceptChallenge(id: string) {
  return xhr.acceptChallenge(id)
  .then(data => {
    router.set('/game' + data.url.round)
  })
  .then(() => challengesApi.remove(id))
  .then(() => close())
}

function declineChallenge(id: string) {
  return xhr.declineChallenge(id)
  .then(() => {
    challengesApi.remove(id)
  })
}

function renderViewOnlyBoard(fen: string, orientation: Color, lastMove?: string, variant?: VariantKey) {
  return h('div.boardWrapper',
    h(ViewOnlyBoard, { fen, lastMove, orientation, variant })
  )
}

function timeLeft(g: NowPlayingGame): Mithril.Child {
  if (!g.isMyTurn) return i18n('waitingForOpponent')
  if (!g.secondsLeft) return i18n('yourTurn')
  const time = window.moment().add(g.secondsLeft, 'seconds')
  return h('time', {
    datetime: time.format()
  }, time.fromNow())
}

function savedGameDataToCardData(data: OnlineGameData): NowPlayingGame {
  return {
    color: data.player.color,
    fen: data.game.fen,
    fullId: data.url.round.substr(1),
    gameId: data.game.id,
    isMyTurn: gameApi.isPlayerTurn(data),
    lastMove: data.game.lastMove,
    perf: data.game.perf,
    opponent: data.opponent.user ? {
      id: data.opponent.user.id,
      username: data.opponent.user.username,
      rating: data.opponent.rating
    } : {
      username: 'Anonymous'
    },
    rated: data.game.rated,
    secondsLeft: data.correspondence && data.correspondence[data.player.color],
    speed: data.game.speed,
    variant: data.game.variant
  }
}

function renderGame(g: NowPlayingGame) {
  const icon = g.opponent.ai ? 'n' : utils.gameIcon(g.perf)
  const playerName = liPlayerName(g.opponent, false)
  const cardClass = [
    'card',
    'standard',
    g.color
  ].join(' ')
  const timeClass = [
    'timeIndication',
    g.isMyTurn ? 'myTurn' : 'opponentTurn'
  ].join(' ')

  return h('div', {
    className: cardClass,
    key: 'game.' + g.gameId,
    oncreate: helper.ontapXY(() => joinGame(g)),
  }, [
    renderViewOnlyBoard(g.fen, g.color, g.lastMove, g.variant.key),
    h('div.infos', [
      h('div.icon-game', { 'data-icon': icon || '' }),
      h('div.description', [
        h('h2.title', playerName),
        h('p', [
          h('span.variant', g.variant.name),
          h('span', { className: timeClass }, timeLeft(g))
        ])
      ])
    ])
  ])
}

function renderIncomingChallenge(c: Challenge) {
  if (!c.challenger) {
    return null
  }

  const mode = c.rated ? i18n('rated') : i18n('casual')
  const timeAndMode = challengesApi.challengeTime(c) + ', ' + mode
  const mark = c.challenger.provisional ? '?' : ''
  const playerName = `${c.challenger.id} (${c.challenger.rating}${mark})`

  return h('div.card.standard.challenge', [
    renderViewOnlyBoard(c.initialFen || standardFen, 'white', undefined, c.variant.key),
    h('div.infos', [
      h('div.icon-game', { 'data-icon': c.perf.icon }),
      h('div.description', [
        h('h2.title', i18n('playerisInvitingYou', playerName)),
        h('p.variant', [
          h('span.variantName', i18n('toATypeGame', c.variant.name)),
          h('span.time-indication[data-icon=p]', timeAndMode)
        ])
      ]),
      h('div.actions', [
        h('button', { oncreate: helper.ontapX(() => acceptChallenge(c.id)) },
          i18n('accept')
        ),
        h('button', {
          oncreate: helper.ontapX(
            helper.fadesOut(() => declineChallenge(c.id), '.card', 250)
          )
        },
          i18n('decline')
        )
      ])
    ])
  ])
}

function renderCarouselIndicators() {
  if (helper.isPortrait() && scroller) {
    return h('div.carouselIndicators',
      range(0, scroller.innerElements.length).map(i =>
        h('i.indicator', {
          className: i === scroller.currentSlide ? 'current' : ''
        })
      )
    )
  }

  return null
}

function renderAllGames() {
  const nowPlaying = session.nowPlaying()
  const challenges = challengesApi.incoming()
  const challengesDom = challenges.map(c => {
    return renderIncomingChallenge(c)
  })

  let allCards = challengesDom.concat(nowPlaying.map(g => renderGame(g)))

  if (!utils.hasNetwork()) {
    allCards = getOfflineGames().map(d => {
      const g = savedGameDataToCardData(d)
      return renderGame(g)
    })
  }

  const newGameCard = h('div.card.standard', {
    key: 'game.new-game',
    oncreate: helper.ontapX(() => {
      close()
      newGameForm.open()
    })
  }, [
    renderViewOnlyBoard(standardFen, 'white'),
    h('div.infos', [
      h('div.description', [
        h('h2.title', i18n('createAGame')),
        h('p', i18n('newOpponent'))
      ])
    ])
  ])

  allCards.unshift(newGameCard)

  return h('div.games_carousel', {
    key: helper.isPortrait() ? 'o-portrait' : 'o-landscape',
    oncreate: wrapperOnCreate,
    onremove: wrapperOnRemove,
  }, allCards)
}
