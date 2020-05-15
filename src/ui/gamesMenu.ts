import * as Mithril from 'mithril'
import h from 'mithril/hyperscript'
import Siema from 'siema'
import addSeconds from 'date-fns/esm/addSeconds'
import * as utils from '../utils'
import redraw from '../utils/redraw'
import { positionsCache } from '../utils/gamePosition'
import { playerName as liPlayerName } from '../lichess/player'
import { NowPlayingGame } from '../lichess/interfaces'
import { Challenge, ChallengeUser } from '../lichess/interfaces/challenge'
import challengesApi from '../lichess/challenges'
import { standardFen } from '../lichess/variant'
import router from '../router'
import session from '../session'
import i18n, { fromNow } from '../i18n'
import * as xhr from '../xhr'
import * as helper from './helper'
import ViewOnlyBoard from './shared/ViewOnlyBoard'

let scroller: any | null = null

let isOpen = false
let lastJoined: NowPlayingGame | undefined

export interface GamesMenu {
  lastJoined(): NowPlayingGame | undefined
  resetLastJoined(): void
  open(page?: number): void
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

function menuOnBeforeRemove({ dom }: Mithril.VnodeDOM<any, any>) {
  dom.classList.add('fading_out')
  return new Promise((resolve) => {
    setTimeout(resolve, 500)
  })
}

function wrapperOnCreate({ dom }: Mithril.VnodeDOM<any, any>) {
  if (helper.isPortrait()) {
    scroller = new Siema({
      selector: dom as HTMLElement,
      duration: 150,
      easing: 'ease-out',
      perPage: helper.isTablet() ? 2 : 1,
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

function open(page?: number) {
  router.backbutton.stack.push(close)
  session.refresh()
  isOpen = true
  setTimeout(() => {
    if (scroller && !helper.isTablet()) {
      scroller.goTo(page !== undefined ? page : 0)
    }
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

function cancelChallenge(id: string) {
  return xhr.cancelChallenge(id)
  .then(() => {
    challengesApi.remove(id)
  })
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
  return h('time', {
  }, fromNow(addSeconds(new Date(), g.secondsLeft)))
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

  return h('div.card.standard.challenge', {
    key: 'incoming.' + c.id,
  }, [
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
            (e: Event) => declineChallenge(c.id).then(() => {
              helper.fadesOut(e, () => close(), '.card', 250)
            })
          )
        },
          i18n('decline')
        )
      ])
    ])
  ])
}

function renderSendingChallenge(c: Challenge) {

  const mode = c.rated ? i18n('rated') : i18n('casual')
  const timeAndMode = challengesApi.challengeTime(c) + ', ' + mode

  function playerName(destUser: ChallengeUser) {
    const mark = destUser.provisional ? '?' : ''
    return `${destUser.id} (${destUser.rating}${mark})`
  }

  return h('div.card.standard.challenge.sending', {
    key: 'sending.' + c.id,
  }, [
    renderViewOnlyBoard(c.initialFen || standardFen, 'white', undefined, c.variant.key),
    h('div.infos', [
      h('div.icon-game', { 'data-icon': c.perf.icon }),
      h('div.description', [
        h('h2.title', c.destUser ? playerName(c.destUser) : 'Open challenge'),
        h('p.variant', [
          h('span.variantName', i18n('toATypeGame', c.variant.name)),
          h('span.time-indication[data-icon=p]', timeAndMode)
        ]),
      ]),
      h('div.actions', [
        h('button', {
          oncreate: helper.ontapX(() => {
            close()
            router.set(`/game/${c.id}`)
          })
        }, i18n('viewInFullSize')),
        h('button', {
          oncreate: helper.ontapX(
            (e: Event) => cancelChallenge(c.id).then(() => {
              helper.fadesOut(e, () => close(), '.card', 250)
            })
          )
        }, i18n('cancel')),
      ])
    ])
  ])
}

function renderCarouselIndicators() {
  if (helper.isPortrait() && scroller) {
    const elsNb = helper.isTablet() ?
      Math.ceil(scroller.innerElements.length / 2) :
      scroller.innerElements.length
    return h('div.carouselIndicators',
      Array(elsNb).fill(1).map((_, i) =>
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
  const sendingChallenges = challengesApi.sending().filter(challengesApi.isPersistent)
  const challengesDom = challenges.map(c =>
    renderIncomingChallenge(c)
  ).filter(utils.noNull)
  const sendingChallengesDom = sendingChallenges.map(c =>
    renderSendingChallenge(c)
  )

  let allCards = [
    ...challengesDom,
    ...(nowPlaying.map(g => renderGame(g))),
    ...sendingChallengesDom,
  ]

  return h('div.games_carousel', {
    oncreate: wrapperOnCreate,
    onremove: wrapperOnRemove,
  }, allCards)
}
