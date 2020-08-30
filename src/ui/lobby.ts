import h from 'mithril/hyperscript'
import * as utils from '../utils'
import redraw from '../utils/redraw'
import * as sleepUtils from '../utils/sleep'
import storage from '../storage'
import session from '../session'
import settings from '../settings'
import spinner from '../spinner'
import router from '../router'
import * as xhr from '../xhr'
import i18n, { plural } from '../i18n'
import socket, { SocketIFace, SEEKING_SOCKET_NAME, RedirectObj } from '../socket'
import { PongMessage, PoolMember, HumanSeekSetup, isPoolMember, isSeekSetup } from '../lichess/interfaces'
import { OnlineGameData } from '../lichess/interfaces/game'
import { humanSetupFromSettings } from '../lichess/setup'
import * as helper from './helper'
import { loader } from './shared/common'
import popupWidget from './shared/popup'

const SETUP_STORAGE_KEY = 'setup.custom.last'

let nbPlayers = 0
let nbGames = 0

// popup is visible and we are currently seeking a game
let isOpenAndSeeking = false

// current setup: either a pool or a seek
let currentSetup: PoolMember | HumanSeekSetup | null = null

// reference created hookId to avoid creating more than 1 hook
let hookId: string | null = null

// we send poolIn message every 10s in case of server disconnection
// (bad network, server restart, etc.)
let poolInIntervalId: number

let socketIface: SocketIFace

const socketHandlers = {
  redirect: (d: RedirectObj) => {
    stopAndClose()
    if (currentSetup !== null)  {
      if (isPoolMember(currentSetup)) {
        leavePool(currentSetup)
      } else {
        storage.set(SETUP_STORAGE_KEY, currentSetup)
      }
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
    doStartSeeking(conf)
  },

  appCancelSeeking() {
    if (isOpenAndSeeking) {
      leavePoolOrCancelHook()
    }
  },

  onNewOpponent(data: OnlineGameData) {
    if (data.game.source === 'pool') {
      const clock = data.clock!
      const poolId = clock.initial / 60 + '+' + clock.increment
      doStartSeeking({ id: poolId })
    } else {
      const setup = currentSetup && isSeekSetup(currentSetup) ? currentSetup :
        storage.get<HumanSeekSetup>(SETUP_STORAGE_KEY) ||
        humanSetupFromSettings(settings.gameSetup.human)

      doStartSeeking(setup)
    }
  },

  view() {

    function content() {
      const nbPlayersStr = plural('nbPlayers', nbPlayers, nbPlayers ? undefined : '?')
      const nbGamesStr = plural('nbGames', nbGames, nbGames ? undefined : '?')

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
          oncreate: helper.ontap(() => userCancelSeeking())
        }, i18n('cancel'))
      ])
    }

    return popupWidget(
      '',
      undefined,
      content,
      isOpenAndSeeking
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
    time = plural('nbDays', setup.days)
  } else {
    time = '∞'
  }
  const variantMode = ` • ${variant} • ${mode}`

  return h('div.gameInfos', [
    h('span[data-icon=p]', time), variantMode
  ])
}

function renderPoolSetup(member: PoolMember) {
  // pool is always rated, this is a hack for anon. fake pool
  const mode = session.isConnected() ? i18n('rated') : i18n('casual')
  const variantMode = ` • Standard • ${mode}`
  return h('div.gameInfos', [
    h('span[data-icon=p]', member.id), variantMode
  ])
}

/*
 * Start seeking according to conf
 *
 * @conf either Pool or Seek
 * @gameId? if provided this argument will trigger a seek like xhr
 */
function doStartSeeking(conf: PoolMember | HumanSeekSetup) {
  router.backbutton.stack.push(userCancelSeeking)

  isOpenAndSeeking = true
  sleepUtils.keepAwake()

  if (isPoolMember(conf)) enterPool(conf)
  else sendHook(conf)
}

function stopAndClose(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpenAndSeeking) router.backbutton.stack.pop()
  isOpenAndSeeking = false
}

function userCancelSeeking(fromBB?: string) {
  stopAndClose(fromBB)
  leavePoolOrCancelHook()
  socket.restorePrevious()
  sleepUtils.allowSleepAgain()
}

function sendHook(setup: HumanSeekSetup) {
  currentSetup = setup
  if (hookId) {
    // normally can't create hook if already have a hook
    cancelHook()
  }
  socketIface = socket.createLobby(SEEKING_SOCKET_NAME, () => {
    // socket on open handler
    // we do want to be sure we don't do anything in background here
    if (!isOpenAndSeeking) return
    // hook already created!
    if (hookId) return

    xhr.seekGame(setup)
    .then(data => {
      hookId = data.hook.id
    })
    .catch(utils.handleXhrError)
  }, socketHandlers)
}

function enterPool(member: PoolMember) {
  currentSetup = member
  socketIface = socket.createLobby(SEEKING_SOCKET_NAME, () => {
    // socket on open handler
    // we do want to be sure we don't do anything in background here
    if (!isOpenAndSeeking) return

    session.refresh()
    .then(() => {
      // ensure session with a refresh
      if (session.isConnected()) {
        socketSend('poolIn', member)
        clearInterval(poolInIntervalId)
        poolInIntervalId = setInterval(() => {
          socketSend('poolIn', member)
        }, 10 * 1000)
      }
      // if anon. use a seek similar to the pool
      else {
        const pool = xhr.cachedPools.find(p => p.id  === member.id)
        if (pool) {
          sendHook({
            mode: 0,
            variant: 1,
            timeMode: 1,
            time: pool.lim,
            increment: pool.inc,
            days: 1,
            color: 'random'
          })
        }
      }
    })

  }, socketHandlers)
}

function leavePoolOrCancelHook() {
  if (currentSetup === null) return
  if (isPoolMember(currentSetup)) {
    leavePool(currentSetup)
  }
  else if (hookId) {
    cancelHook()
  }
}

function leavePool(member: PoolMember) {
  clearInterval(poolInIntervalId)
  socketSend('poolOut', member.id)
}

function cancelHook() {
  socketSend('cancel', hookId)
  hookId = null
}

function socketSend<D>(t: string, d: D): void {
  if (socketIface) socketIface.send(t, d)
}
