import * as Mithril from 'mithril'
import { Plugins } from '@capacitor/core'
import h from 'mithril/hyperscript'
import * as helper from '../helper'
import redraw from '../../utils/redraw'
import LRUMap from '../../utils/lru'
import { requestIdleCallback } from '../../utils'
import i18n from '../../i18n'
import asyncStorage from '../../asyncStorage'
import { Player } from '../../lichess/interfaces/game'
import { ChatMsg } from '../../lichess/interfaces/chat'
import router from '../../router'
import { SocketIFace } from '../../socket'
import { closeIcon } from '../shared/icons'

export type ChatStore = 'Corres' | 'Game' | 'Study'

export class Chat {
  public showing: boolean
  public nbUnread: number
  public inputValue: string
  public lines: Array<ChatMsg>

  constructor(
    readonly socketIface: SocketIFace,
    readonly id: string,
    lines: Array<ChatMsg>,
    readonly player: Player | undefined,
    readonly writeable: boolean,
    readonly isShadowban: boolean,
    readonly storeKey: ChatStore,
  ) {

    this.showing = false
    this.lines = lines
    this.inputValue = ''
    this.nbUnread = 0

    this.checkUnreadFromStorage()
  }

  public open = () => {
    router.backbutton.stack.push(helper.slidesOutDown(this.close, 'chat'))
    this.showing = true
    this.nbUnread = 0
  }

  public close = (fromBB?: string) => {
    Plugins.Keyboard.hide()
    if (fromBB !== 'backbutton' && this.showing) router.backbutton.stack.pop()
    this.showing = false
    this.nbUnread = 0
    this.storeNbLinesRead()
  }

  public onReload = (lines?: ChatMsg[]) => {
    if (lines !== undefined) {
      this.lines = lines
      this.checkUnreadFromStorage()
    }
  }

  public append = (msg: ChatMsg) => {
    this.lines.push(msg)
    if (msg.u !== 'lichess') {
      this.nbUnread++
    }
    redraw()
  }

  public selectLines() {
    let prev: ChatMsg
    let ls: ChatMsg[] = []
    this.lines.forEach((line: ChatMsg) => {
      if (this.isLegitMsg(line) &&
        (!prev || !compactableDeletedLines(prev, line))
      ) {
        ls.push(line)
      }
      prev = line
    })
    return ls
  }

  // --

  private isLegitMsg = (msg: ChatMsg) => {
    return !msg.d && (!msg.r || this.isShadowban) && !isSpam(msg.t)
  }

  private nbLines(): number {
    return this.lines.filter(this.isLegitMsg).length
  }

  private checkUnreadFromStorage() {
    getReadCount(this.storeKey, this.id).then(nb => {
      const storedNb = nb || 0
      const actualNb = this.nbLines()
      if (this.lines !== undefined && storedNb < actualNb) {
        this.nbUnread = this.nbUnread + (actualNb - storedNb)
        redraw()
      }
    })
  }

  private storeNbLinesRead() {
    const linesRead = this.nbLines()
    if (linesRead > 0) {
      requestIdleCallback(() => {
        setReadCount(this.storeKey, this.id, linesRead)
      })
    }
  }
}

export function chatView(ctrl: Chat, header?: string) {

  if (!ctrl.showing) return null

  return h('div#chat.modal', { oncreate: helper.slidesInUp }, [
    h('header', [
      h('button.modal_close', {
        oncreate: helper.ontap(helper.slidesOutDown(ctrl.close, 'chat'))
      }, closeIcon),
      h('h2', header || i18n('chatRoom'))
    ]),
    h('div#chat_content.modal_content.chat_content', [
      h('ul.chat_scroller.native_scroller', {
        oncreate: ({ dom }: Mithril.VnodeDOM<any, any>) => scrollChatToBottom(dom as HTMLElement),
        onupdate: ({ dom }: Mithril.VnodeDOM<any, any>) => scrollChatToBottom(dom as HTMLElement)
      },
        ctrl.selectLines().map((msg: ChatMsg, i: number, all: ChatMsg[]) => {
          if (ctrl.player !== undefined) return renderPlayerMsg(ctrl.player, msg, i, all)
          else return renderSpectatorMsg(msg)
        })
      ),
      h('form.chat_form', {
        onsubmit(e: Event) {
          e.preventDefault()
          const target = (e.target as HTMLFormElement)
          const ta = target[0] as HTMLTextAreaElement
          ta.focus()
          const msg = ta.value.trim()
          if (!validateMsg(msg)) return
          ctrl.inputValue = ''
          ta.setAttribute('rows', '1')
          ta.style.paddingTop = '8px'
          ctrl.socketIface.send('talk', msg)
          const sendButton = document.getElementById('chat_send')
          if (sendButton) {
            sendButton.classList.add('disabled')
          }
          return false
        }
      }, [
        h('textarea#chat_input.chat_input', {
          placeholder: ctrl.writeable ? i18n('talkInChat') : 'Chat is disabled.',
          disabled: !ctrl.writeable,
          rows: 1,
          maxlength: 140,
          value: ctrl.inputValue,
          style: { lineHeight: '18px', margin: '8px 0 8px 10px', paddingTop: '8px' },
          oninput(e: Event) {
            const ta = (e.target as HTMLTextAreaElement)
            if (ta.value.length > 140) ta.value = ta.value.substr(0, 140)
            ctrl.inputValue = ta.value
            const style = window.getComputedStyle(ta)
            const taLineHeight = parseInt(style.lineHeight || '18', 10)
            const taHeight = calculateContentHeight(ta, taLineHeight)
            const computedNbLines = Math.ceil(taHeight / taLineHeight)
            const nbLines =
              computedNbLines <= 1 ? 1 :
              computedNbLines > 5 ? 5 : computedNbLines - 1
            ta.setAttribute('rows', String(nbLines))
            if (nbLines === 1) ta.style.paddingTop = '8px'
            else ta.style.paddingTop = '0'
            const sendButton = document.getElementById('chat_send')
            if (sendButton) {
              if (validateMsg(ctrl.inputValue)) sendButton.classList.remove('disabled')
              else sendButton.classList.add('disabled')
            }
          }
        }),
        h('button#chat_send.chat_send.fa.fa-telegram.disabled')
      ])
    ])
  ])
}

function renderPlayerMsg(player: Player, msg: ChatMsg, i: number, all: ChatMsg[]) {
  const lichessTalking = msg.u === 'lichess'
  const playerTalking = msg.c ? msg.c === player.color :
    player.user && msg.u === player.user.username

  let closeBalloon = true
  let next = all[i + 1]
  let nextTalking
  if (next) {
    nextTalking = next.c ? next.c === player.color :
    player.user && next.u === player.user.username
  }
  if (nextTalking !== undefined) closeBalloon = nextTalking !== playerTalking

  return h('li.chat_msg.allow_select', {
    className: helper.classSet({
      system: lichessTalking,
      player: !!playerTalking,
      opponent: !lichessTalking && !playerTalking,
      'close_balloon': closeBalloon
    })
  }, msg.t)
}

function renderSpectatorMsg(msg: ChatMsg) {
  const lichessTalking = msg.u === 'lichess'

  return h('li.spectator_chat_msg.allow_select', {
    className: helper.classSet({
      system: lichessTalking,
    })
  }, lichessTalking ? msg.t : [
    h('strong', msg.u),
    h.trust('&nbsp;'), h.trust('&nbsp;'),
    h('span', msg.t)
  ])
}

function scrollChatToBottom(el: HTMLElement) {
  el.scrollTop = el.scrollHeight
}

function calculateContentHeight(ta: HTMLElement, scanAmount: number): number {
  const origHeight = ta.style.height,
  scrollHeight = ta.scrollHeight,
  overflow = ta.style.overflow
  let height = ta.offsetHeight
  /// only bother if the ta is bigger than content
  if (height >= scrollHeight) {
    /// check that our browser supports changing dimension
    /// calculations mid-way through a function call...
    ta.style.height = (height + scanAmount) + 'px'
    /// because the scrollbar can cause calculation problems
    ta.style.overflow = 'hidden'
    /// by checking that scrollHeight has updated
    if ( scrollHeight < ta.scrollHeight ) {
      /// now try and scan the ta's height downwards
      /// until scrollHeight becomes larger than height
      while (ta.offsetHeight >= ta.scrollHeight) {
        ta.style.height = (height -= scanAmount) + 'px'
      }
      /// be more specific to get the exact height
      while (ta.offsetHeight < ta.scrollHeight) {
        ta.style.height = (height++) + 'px'
      }
      /// reset the ta back to it's original height
      ta.style.height = origHeight
      /// put the overflow back
      ta.style.overflow = overflow
      return height
    }
  }

  return scrollHeight
}

function isSpam(txt: string) {
  return /chess-bot/.test(txt)
}

function compactableDeletedLines(l1: ChatMsg, l2: ChatMsg) {
  return l1.d && l2.d && l1.u === l2.u
}

function validateMsg(msg: string): boolean {
  if (!msg) return false
  return msg.trim().length <= 140
}

interface Storage {
  Corres: {
    key: 'corresChat',
    readCounts?: LRUMap<string, number>
  },
  Game: {
    key: 'gameChat',
    readCounts?: LRUMap<string, number>
  },
  Study: {
    key: 'studyChat',
    readCounts?: LRUMap<string, number>
  },
}
const storage: Storage = {
  Corres: {
    key: 'corresChat',
  },
  Game: {
    key: 'gameChat',
  },
  Study: {
    key: 'studyChat',
  },
}

function initStorage(storeKey: ChatStore): Promise<void> {
  const store = storage[storeKey]
  if (store.readCounts) return Promise.resolve()
  else {
    return asyncStorage.get<Array<[string, number]>>(store.key)
    .then(data => {
      if (data) store.readCounts = new LRUMap<string, number>(100, data)
      else store.readCounts = new LRUMap<string, number>(100)
    })
  }
}

async function getReadCount(storeKey: ChatStore, id: string): Promise<number | undefined> {
  await initStorage(storeKey)
  return storage[storeKey].readCounts?.get(id)
}

async function setReadCount(storeKey: ChatStore, id: string, nb: number): Promise<void> {
  await initStorage(storeKey)
  const store = storage[storeKey]
  if (store.readCounts) {
    store.readCounts.set(id, nb)
    asyncStorage.set(store.key, store.readCounts.toJSON())
  }
}
