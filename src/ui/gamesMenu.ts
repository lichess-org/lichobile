import h from 'mithril/hyperscript'
import addSeconds from 'date-fns/esm/addSeconds'
import * as utils from '../utils'
import redraw from '../utils/redraw'
import { batchRequestAnimationFrame } from '../utils/batchRAF'
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
import Siema from './helper/Siema'
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
    }, h.fragment({ key: helper.isPortrait() ? 'portrait' : 'landscape' }, [
      h('div.wrapper_overlay_close', { oncreate: menuOnOverlayTap }),
      renderDotsWrapper(),
      h('div#wrapper_games', renderAllGames()),
    ]))
  }
}

const menuOnOverlayTap = helper.ontap(() => close())

function menuOnBeforeRemove({ dom }: Mithril.VnodeDOM<any, any>) {
  dom.classList.add('fading_out')
  return new Promise((resolve) => {
    setTimeout(resolve, 500)
  })
}

let cardChangeTimeoutId: number
function wrapperOnCreate({ dom }: Mithril.VnodeDOM<any, any>) {
  if (helper.isPortrait()) {
    scroller = new Siema({
      selector: dom as HTMLElement,
      duration: 250,
      loop: false,
      perPage: helper.isTablet() ? 2 : 1,
      startIndex: 0,
      threshold: 50, // TODO adapt depending on screen size
      draggable: true,
      onChange: () => {
        clearTimeout(cardChangeTimeoutId)
        cardChangeTimeoutId = setTimeout(() => {
          batchRequestAnimationFrame(redrawDots)
        }, 300)
      },
    })
    batchRequestAnimationFrame(redrawDots)
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
  }, 500)
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
        c.destUser ? null : h('button', {
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

function renderDotsWrapper() {
  if (helper.isPortrait()) {
    return h('div.#games_menu__dots')
  }

  return null
}

function redrawDots() {
  if (helper.isPortrait() && scroller) {
    const elsNb = helper.isTablet() ?
      Math.ceil(scroller.innerElements.length / 2) :
      scroller.innerElements.length

    const wrapper = document.getElementById('games_menu__dots')
    if (wrapper) {
      const dotsNb = wrapper.childElementCount
      const diff = elsNb - dotsNb
      if (diff !== 0) {
        for (let i = 0, len = Math.abs(diff); i < len; i++) {
          if (diff > 0) {
            const dot = document.createElement('i')
            dot.className = 'dot'
            wrapper.appendChild(dot)
          } else {
            const child = wrapper.firstChild
            if (child) {
              wrapper.removeChild(child)
            }
          }
        }
      }
      const nodeList = wrapper.childNodes
      for (let i = 0; i < nodeList.length; i++) {
        const dot = nodeList[i] as HTMLElement
        if (i === scroller.currentSlide) {
          dot.className = 'dot current'
        } else {
          dot.className = 'dot'
        }
      }
    }
  }
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

  const allCards = [
    ...challengesDom,
    ...(nowPlaying.map(g => renderGame(g))),
    ...sendingChallengesDom,
  ]

  return h('div.games_carousel', {
    oncreate: wrapperOnCreate,
    onremove: wrapperOnRemove,
  }, allCards)
}
