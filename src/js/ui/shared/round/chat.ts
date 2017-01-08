import * as helper from '../../helper';
import redraw from '../../../utils/redraw';
import i18n from '../../../i18n';
import storage from '../../../storage';
import session from '../../../session';
import * as gameApi from '../../../lichess/game';
import router from '../../../router';
import socket from '../../../socket';
import * as m from 'mithril';
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

    this.checkUnreadFromStorage();
    this.storeLength()

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

function isSpam(txt: string) {
  return /chess-bot/.test(txt);
}

function compactableDeletedLines(l1: ChatMsg, l2: ChatMsg) {
  return l1.d && l2.d && l1.u === l2.u;
}

export function chatView(ctrl: Chat) {

  if (!ctrl.showing) return null;

  const player = ctrl.root.data.player;
  let header = (!ctrl.root.data.opponent.user || ctrl.root.data.player.spectator) ? i18n('chat') : ctrl.root.data.opponent.user.username;
  const watchers = ctrl.root.data.watchers;
  if (ctrl.root.data.player.spectator && watchers && watchers.nb >= 2) {
    header = i18n('spectators') + ' ' + watchers.nb;
  }

  return m('div#chat.modal', { oncreate: helper.slidesInUp }, [
    m('header', [
      m('button.modal_close[data-icon=L]', {
        oncreate: helper.ontap(helper.slidesOutDown(ctrl.close, 'chat'))
      }),
      m('h2', header)
    ]),
    m('div.modal_content', [
      m('div#chat_scroller.native_scroller', {
        oncreate: ({ dom }: Mithril.ChildNode) => scrollChatToBottom(dom as HTMLElement),
        onupdate: ({ dom }: Mithril.ChildNode) => scrollChatToBottom(dom as HTMLElement)
      }, [
        m('ul.chat_messages', ctrl.selectLines().map((msg: ChatMsg, i: number, all: ChatMsg[]) => {

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

          return m('li.chat_msg.allow_select', {
            className: helper.classSet({
              system: lichessTalking,
              player: playerTalking,
              opponent: !lichessTalking && !playerTalking,
              'close_balloon': closeBalloon
            })
          }, msg.t);
        }))
      ]),
      m('form.chat_form', {
        onsubmit: (e: Event) => {
          e.preventDefault();
          const target = (e.target as any)
          const msg = target[0].value.trim();
          if (!msg) return;
          if (msg.length > 140) {
            return;
          }
          ctrl.inputValue = '';
          socket.send('talk', msg);
        }
      }, [
        m('input#chat_input.chat_input[type=text]', {
          placeholder: ctrl.canTalk() ? i18n('talkInChat') : 'Login to chat',
          disabled: !ctrl.canTalk(),
          maxlength: 140,
          value: ctrl.inputValue,
          oninput(e: Event) {
            ctrl.inputValue = (e.target as any).value
          }
        }),
        m('button.chat_send[data-icon=z]')
      ])
    ])
  ]);
}

function scrollChatToBottom(el: HTMLElement) {
  el.scrollTop = el.scrollHeight;
}

function onKeyboardShow(e: Ionic.KeyboardEvent) {
  if (window.cordova.platformId === 'ios') {
    const chat = document.getElementById('chat_scroller');
    if (!chat) return;
    chatHeight = chat.offsetHeight;
    chat.style.height = (chatHeight - e.keyboardHeight) + 'px';
  }
}

function onKeyboardHide() {
  if (window.cordova.platformId === 'ios') {
    const chat = document.getElementById('chat_scroller');
    if (chat) chat.style.height = chatHeight + 'px';
  }
  const input = document.getElementById('chat_input');
  if (input) input.blur();
}
