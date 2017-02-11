import * as helper from '../../helper';
import redraw from '../../../utils/redraw';
import i18n from '../../../i18n';
import storage from '../../../storage';
import session from '../../../session';
import * as gameApi from '../../../lichess/game';
import router from '../../../router';
import socket from '../../../socket';
import { closeIcon } from '../../shared/icons'
import * as h from 'mithril/hyperscript';
import { OnlineRoundInterface } from '.';

let chatHeight: number;

export class Chat {
  public root: OnlineRoundInterface
  public isShadowban: boolean
  public showing: boolean
  public messages: ChatMsg[]
  public unread: boolean
  public inputValue: string
  private storageId: string

  constructor(root: OnlineRoundInterface, isShadowban: boolean) {

    this.storageId = 'chat.' + root.data.game.id;
    this.root = root;
    this.isShadowban = isShadowban;
    this.showing = false;
    this.messages = root.data.chat || [];
    this.inputValue = '';
    this.unread = false;

    if (gameApi.playable(this.root.data)) {
      this.checkUnreadFromStorage();
      this.storeLength()
    }

    window.addEventListener('native.keyboardhide', onKeyboardHide);
    window.addEventListener('native.keyboardshow', onKeyboardShow);
  }

  private checkUnreadFromStorage() {
    const nbMessages = storage.get(this.storageId);
    if (this.messages && nbMessages < this.messages.length) this.unread = true;
  }

  private storeLength() {
    storage.set(this.storageId, this.messages.length);
  }

  public canTalk = () => {
    return !this.root.data.player.spectator || session.isConnected();
  }

  public open = () => {
    router.backbutton.stack.push(helper.slidesOutDown(this.close, 'chat'));
    this.showing = true;
  }

  public close = (fromBB?: string) => {
    window.cordova.plugins.Keyboard.close();
    if (fromBB !== 'backbutton' && this.showing) router.backbutton.stack.pop();
    this.showing = false;
    this.unread = false;
  }

  public onReload = (messages: ChatMsg[]) => {
    if (!messages) {
      return;
    }
    this.messages = messages;
    this.checkUnreadFromStorage();
    this.storeLength()
  }

  public append = (msg: ChatMsg) => {
    this.messages.push(msg);
    this.storeLength()
    if (msg.u !== 'lichess') this.unread = true;
    redraw();
  }

  public selectLines() {
    let prev: ChatMsg
    let ls: ChatMsg[] = []
    this.messages.forEach((line: ChatMsg) => {
      if (!line.d &&
        (!prev || !compactableDeletedLines(prev, line)) &&
        (!line.r || this.isShadowban) &&
        !isSpam(line.t)
      ) ls.push(line);
      prev = line;
    });
    return ls;
  }

  public unload = () => {
    if (!gameApi.playable(this.root.data)) storage.remove(this.storageId);
    document.removeEventListener('native.keyboardhide', onKeyboardHide);
    document.removeEventListener('native.keyboardshow', onKeyboardShow);
  }
}

export function chatView(ctrl: Chat) {

  if (!ctrl.showing) return null;

  const player = ctrl.root.data.player;
  let header = (!ctrl.root.data.opponent.user || ctrl.root.data.player.spectator) ? i18n('chat') : ctrl.root.data.opponent.user.username;
  const watchers = ctrl.root.data.watchers;
  if (ctrl.root.data.player.spectator && watchers && watchers.nb >= 2) {
    header = i18n('spectators') + ' ' + watchers.nb;
  }

  return h('div#chat.modal', { oncreate: helper.slidesInUp }, [
    h('header', [
      h('button.modal_close', {
        oncreate: helper.ontap(helper.slidesOutDown(ctrl.close, 'chat'))
      }, closeIcon),
      h('h2', header)
    ]),
    h('div#chat_content.modal_content.chat_content', [
      h('div.chat_scroller.native_scroller', {
        oncreate: ({ dom }: Mithril.DOMNode) => scrollChatToBottom(dom as HTMLElement),
        onupdate: ({ dom }: Mithril.DOMNode) => scrollChatToBottom(dom as HTMLElement)
      }, [
        h('ul.chat_messages', ctrl.selectLines().map((msg: ChatMsg, i: number, all: ChatMsg[]) => {

          const lichessTalking = msg.u === 'lichess';
          const playerTalking = msg.c ? msg.c === player.color :
          player.user && msg.u === player.user.username;

          let closeBalloon = true;
          let next = all[i + 1];
          let nextTalking;
          if (next) {
            nextTalking = next.c ? next.c === player.color :
            player.user && next.u === player.user.username;
          }
          if (nextTalking !== undefined) closeBalloon = nextTalking !== playerTalking;

          return h('li.chat_msg.allow_select', {
            className: helper.classSet({
              system: lichessTalking,
              player: playerTalking,
              opponent: !lichessTalking && !playerTalking,
              'close_balloon': closeBalloon
            })
          }, msg.t);
        }))
      ]),
      h('form.chat_form', {
        onsubmit: (e: Event) => {
          e.preventDefault();
          const target = (e.target as HTMLFormElement)
          const ta = target[0]
          ta.focus()
          const msg = ta.value.trim();
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
          placeholder: ctrl.canTalk() ? i18n('talkInChat') : 'Login to chat',
          disabled: !ctrl.canTalk(),
          rows: 1,
          maxlength: 140,
          value: ctrl.inputValue,
          style: { lineHeight: '18px', margin: '8px 0 8px 10px', paddingTop: '8px' },
          oninput(e: Event) {
            const sendButton = document.getElementById('chat_send')
            const ta = (e.target as HTMLTextAreaElement)
            if (ta.value.length > 140) ta.value = ta.value.substr(0, 140)
            ctrl.inputValue = ta.value
            const style = window.getComputedStyle(ta)
            const taLineHeight = parseInt(style.lineHeight, 10)
            const taHeight = calculateContentHeight(ta, taLineHeight)
            const computedNbLines = Math.ceil(taHeight / taLineHeight)
            const nbLines =
              computedNbLines <= 1 ? 1 :
              computedNbLines > 5 ? 5 : computedNbLines - 1
            ta.setAttribute('rows', String(nbLines))
            if (nbLines === 1) ta.style.paddingTop = '8px'
            else ta.style.paddingTop = '0'
            if (validateMsg(ctrl.inputValue)) sendButton.classList.remove('disabled')
            else sendButton.classList.add('disabled')
          }
        }),
        h('button#chat_send.chat_send.fa.fa-telegram.disabled')
      ])
    ])
  ]);
}

function scrollChatToBottom(el: HTMLElement) {
  el.scrollTop = el.scrollHeight;
}

function onKeyboardShow(e: Ionic.KeyboardEvent) {
  if (window.cordova.platformId === 'ios') {
    const chat = document.getElementById('chat_content');
    if (!chat) return;
    chatHeight = chat.offsetHeight;
    chat.style.height = (chatHeight - e.keyboardHeight) + 'px';
  }
}

function onKeyboardHide() {
  if (window.cordova.platformId === 'ios') {
    const chat = document.getElementById('chat_content');
    if (chat) chat.style.height = chatHeight + 'px';
  }
  const input = document.getElementById('chat_input');
  if (input) input.blur();
}

function calculateContentHeight(ta: HTMLElement, scanAmount: number): number {
  const origHeight = ta.style.height,
  scrollHeight = ta.scrollHeight,
  overflow = ta.style.overflow;
  let height = ta.offsetHeight
  /// only bother if the ta is bigger than content
  if (height >= scrollHeight) {
    /// check that our browser supports changing dimension
    /// calculations mid-way through a function call...
    ta.style.height = (height + scanAmount) + 'px';
    /// because the scrollbar can cause calculation problems
    ta.style.overflow = 'hidden';
    /// by checking that scrollHeight has updated
    if ( scrollHeight < ta.scrollHeight ) {
      /// now try and scan the ta's height downwards
      /// until scrollHeight becomes larger than height
      while (ta.offsetHeight >= ta.scrollHeight) {
        ta.style.height = (height -= scanAmount)+'px';
      }
      /// be more specific to get the exact height
      while (ta.offsetHeight < ta.scrollHeight) {
        ta.style.height = (height++)+'px';
      }
      /// reset the ta back to it's original height
      ta.style.height = origHeight;
      /// put the overflow back
      ta.style.overflow = overflow;
      return height;
    }
  } else {
    return scrollHeight;
  }
}

function isSpam(txt: string) {
  return /chess-bot/.test(txt);
}

function compactableDeletedLines(l1: ChatMsg, l2: ChatMsg) {
  return l1.d && l2.d && l1.u === l2.u;
}

function validateMsg(msg: string): boolean {
  if (!msg) return false
  return msg.trim().length <= 140
}
