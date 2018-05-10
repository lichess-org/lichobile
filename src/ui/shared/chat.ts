import * as h from 'mithril/hyperscript'
import * as helper from '../helper'
import redraw from '../../utils/redraw'
import i18n from '../../i18n'
import asyncStorage from '../../asyncStorage'
import { Player } from '../../lichess/interfaces/game'
import { ChatMsg } from '../../lichess/interfaces/chat'
import router from '../../router'
import socket from '../../socket'
import { closeIcon } from '../shared/icons'

let chatHeight: number

export class Chat {
  public showing: boolean
  public nbUnread: number
  public inputValue: string
  public lines: Array<ChatMsg>

  private storageId: string

  constructor(
    readonly id: string,
    lines: Array<ChatMsg>,
    readonly player: Player | undefined,
    readonly writeable: boolean,
    readonly isShadowban: boolean,
  ) {

    this.showing = false
    this.storageId = 'chat.' + id
    this.lines = lines
    this.inputValue = ''
    this.nbUnread = 0

    this.checkUnreadFromStorage()

    window.addEventListener('keyboardDidHide', onKeyboardHide)
    window.addEventListener('keyboardDidShow', onKeyboardShow)
  }

  public open = () => {
    router.backbutton.stack.push(helper.slidesOutDown(this.close, 'chat'))
    this.showing = true
    this.nbUnread = 0
  }

  public close = (fromBB?: string) => {
    window.Keyboard.close()
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

  public unload = () => {
    window.removeEventListener('keyboardDidHide', onKeyboardHide)
    window.removeEventListener('keyboardDidShow', onKeyboardShow)
  }

  // --

  private isLegitMsg = (msg: ChatMsg) => {
    return !msg.d && (!msg.r || this.isShadowban) && !isSpam(msg.t)
  }

  private nbLines(): number {
    return this.lines.filter(this.isLegitMsg).length
  }

  private checkUnreadFromStorage() {
    asyncStorage.getItem<number>(this.storageId)
    .then(data => {
      const storedNb = data || 0
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
      asyncStorage.setItem(this.storageId, linesRead)
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
      h('div.chat_scroller.native_scroller', {
        oncreate: ({ dom }: Mithril.DOMNode) => scrollChatToBottom(dom as HTMLElement),
        onupdate: ({ dom }: Mithril.DOMNode) => scrollChatToBottom(dom as HTMLElement)
      }, [
        h('ul.chat_messages', ctrl.selectLines().map((msg: ChatMsg, i: number, all: ChatMsg[]) => {
          if (ctrl.player !== undefined) return renderPlayerMsg(ctrl.player, msg, i, all)
          else return renderSpectatorMsg(msg)
        }))
      ]),
      h('form.chat_form', {
        onsubmit: (e: Event) => {
          e.preventDefault()
          const target = (e.target as HTMLFormElement)
          const ta = target[0]
          ta.focus()
          const msg = ta.value.trim()
          if (!validateMsg(msg)) return
          ctrl.inputValue = ''
          ta.setAttribute('rows', '1')
          ta.style.paddingTop = '8px'
          socket.send('talk', msg)
          const sendButton = document.getElementById('chat_send')
          if (sendButton) {
            sendButton.classList.add('disabled')
          }
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

function onKeyboardShow(e: Ionic.KeyboardEvent) {
  if (window.cordova.platformId === 'ios') {
    const chat = document.getElementById('chat_content')
    if (!chat) return
    chatHeight = chat.offsetHeight
    chat.style.height = (chatHeight - e.keyboardHeight) + 'px'
  }
}

function onKeyboardHide() {
  if (window.cordova.platformId === 'ios') {
    const chat = document.getElementById('chat_content')
    if (chat) chat.style.height = chatHeight + 'px'
  }
  const input = document.getElementById('chat_input')
  if (input) input.blur()
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
