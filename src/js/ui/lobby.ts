import * as h from 'mithril/hyperscript'
import * as utils from '../utils'
import redraw from '../utils/redraw'
import session from '../session'
import settings from '../settings'
import spinner from '../spinner'
import router from '../router'
import * as xhr from '../xhr'
import i18n from '../i18n'
import socket, { RedirectObj } from '../socket'
import { PongMessage, PoolMember, HumanSeekSetup, isPoolMember, isSeekSetup } from '../lichess/interfaces'
import { humanSetupFromSettings } from '../lichess/setup'
import * as helper from './helper'
import { loader } from './shared/common'
import popupWidget from './shared/popup'

let nbPlayers = 0
let nbGames = 0
let isOpen = false

// current setup: either a pool or a seek
let currentSetup: PoolMember | HumanSeekSetup | null = null

// reference created hookId to avoid creating more than 1 hook
let hookId: string | null = null
// we send poolIn message every 10s in case of server disconnection
// (bad network, server restart, etc.)
let poolInIntervalId: number

const socketHandlers = {
  redirect: (d: RedirectObj) => {
    closePopup()
    if (currentSetup !== null && isPoolMember(currentSetup)) {
      leavePool()
    }
    socket.redirectToGame(d)
  },
  n: (_: never, d: PongMessage) => {
    nbPlayers = d.d
    nbGames = d.r
    redraw()
  }
}

export default {
  startSeeking(conf: PoolMember | HumanSeekSetup) {
    // anon. can't enter pool: we'll just create a similar hook
    if (isPoolMember(conf) && !session.isConnected()) {
      doStartAnonPoolSeek(conf)
    }
    else {
      doStartSeeking(conf)
    }
  },

  cancelSeeking,

  onNewOpponent() {
    if (currentSetup) doStartSeeking(currentSetup)
    // if no setup get it from localstorage
    else {
      const conf = settings.gameSetup.human
      const poolId = conf.pool()
      if (poolId && conf.preset() === 'quick') {
        const pm = { id: poolId }
        if (session.isConnected()) doStartAnonPoolSeek(pm)
        else doStartSeeking(pm)
      } else {
        doStartSeeking(humanSetupFromSettings(conf))
      }
    }
  },

  view() {

    function content() {
      const nbPlayersStr = i18n('nbConnectedPlayers', nbPlayers || '?')
      const nbGamesStr = i18n('nbGamesInPlay', nbGames || '?')

      if (currentSetup === null) {
        return h('div.lobby-waitingPopup', 'Something went wrong. Please try again')
      }

      return h('div.lobby-waitingPopup', [
        h('div.lobby-waitingForOpponent', i18n('waitingForOpponent')),
        h('br'),
        isPoolMember(currentSetup) ?
          renderPoolSetup(currentSetup) :
          renderCustomSetup(currentSetup),
        h('br'),
        spinner.getVdom(),
        h('div.lobby-nbPlayers', socket.isConnected() ? [
          h('div',
            h.trust(nbPlayersStr.replace(/(\d+)/, '<strong>$1</strong>'))
          ),
          h('div',
            h.trust(nbGamesStr.replace(/(\d+)/, '<strong>$1</strong>'))
          ),
        ] : h('div', [i18n('reconnecting'), loader])),
        h('button[data-icon=L]', {
          oncreate: helper.ontap(() => cancelSeeking())
        }, i18n('cancel'))
      ])
    }

    return popupWidget(
      '',
      undefined,
      content,
      isOpen
    )
  }
}

function renderCustomSetup(setup: HumanSeekSetup) {
  const availableVariants = settings.gameSetup.human.availableVariants
  const variantConf = availableVariants.find(v => v[1] === String(setup.variant))
  const variant = variantConf && variantConf[0] || 'Standard'
  const timeMode = setup.timeMode
  const mode = setup.mode === 0 ? i18n('casual') : i18n('rated')
  const minutes = setup.time
  let time: string
  if (timeMode === 1) {
    time = utils.displayTime(String(minutes)) + '+' + setup.increment
  } else if (timeMode === 2) {
    time = i18n('nbDays', setup.days)
  } else {
    time = '∞'
  }
  const variantMode = ` • ${variant} • ${mode}`

  return h('div.gameInfos', [
    h('span[data-icon=p]', time), variantMode
  ])
}

function renderPoolSetup(member: PoolMember) {
  const variantMode = ` • Standard • ${i18n('rated')}`
  return h('div.gameInfos', [
    h('span[data-icon=p]', member.id), variantMode
  ])
}

function doStartSeeking(conf: PoolMember | HumanSeekSetup) {
  router.backbutton.stack.push(cancelSeeking)

  isOpen = true

  window.plugins.insomnia.keepAwake()

  if (isPoolMember(conf)) enterPool(conf)
  else if (isSeekSetup(conf)) sendHook(conf)
}

function doStartAnonPoolSeek(poolMember: PoolMember) {
  const pool = xhr.cachedPools.find(p => p.id  === poolMember.id)
  if (pool) {
    doStartSeeking({
      mode: 0,
      variant: 1,
      timeMode: 1,
      time: pool.lim,
      increment: pool.inc,
      days: 1,
      color: 'random'
    })
  } else {
    window.plugins.toast.show('Error. Could not find pool', 'short', 'center')
  }
}

function closePopup(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
  isOpen = false
}

function cancelSeeking(fromBB?: string) {
  closePopup(fromBB)

  if (currentSetup === null) return

  if (isPoolMember(currentSetup)) {
    leavePool()
  }
  else if (hookId) {
    socket.send('cancel', hookId)
    hookId = null
  }

  socket.restorePrevious()

  window.plugins.insomnia.allowSleepAgain()
}

function sendHook(setup: HumanSeekSetup) {
  currentSetup = setup
  hookId = null
  socket.createLobby(() => {
    if (hookId) return // hook already created!
    xhr.seekGame(setup)
    .then(data => {
      hookId = data.hook.id
    })
    .catch(utils.handleXhrError)
  }, socketHandlers)
}

function enterPool(member: PoolMember) {
  currentSetup = member
  socket.createLobby(() => {
    socket.send('poolIn', member)
    clearInterval(poolInIntervalId)
    poolInIntervalId = setInterval(() => {
      socket.send('poolIn', member)
    }, 10 * 1000)
  }, socketHandlers)
}

function leavePool() {
  if (currentSetup !== null && isPoolMember(currentSetup)) {
    clearInterval(poolInIntervalId)
    socket.send('poolOut', currentSetup.id)
  }
}
