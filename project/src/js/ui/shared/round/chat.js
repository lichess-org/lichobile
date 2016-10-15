import * as helper from '../../helper';
import redraw from '../../../utils/redraw';
import i18n from '../../../i18n';
import storage from '../../../storage';
import * as gameApi from '../../../lichess/game';
import backbutton from '../../../backbutton';
import socket from '../../../socket';
import * as m from 'mithril';

export function chatCtrl(root, isShadowban) {
  const storageId = 'chat.' + root.data.game.id;

  let chatHeight;

  this.root = root;
  this.isShadowban = isShadowban;
  this.showing = false;
  this.messages = root.data.chat || [];
  this.inputValue = '';
  this.unread = false;

  var checkUnreadFromStorage = function() {
    var nbMessages = storage.get(storageId);
    if (this.messages && nbMessages < this.messages.length) this.unread = true;
  }.bind(this);

  checkUnreadFromStorage();
  storage.set(storageId, this.messages.length);

  this.open = function() {
    backbutton.stack.push(helper.slidesOutDown(this.close, 'chat'));
    this.showing = true;
  }.bind(this);

  this.close = function(fromBB) {
    window.cordova.plugins.Keyboard.close();
    if (fromBB !== 'backbutton' && this.showing) backbutton.stack.pop();
    this.showing = false;
    this.unread = false;
  }.bind(this);

  this.onReload = function(messages) {
    if (!messages) {
      return;
    }
    this.messages = messages;
    checkUnreadFromStorage();
    storage.set(storageId, this.messages.length);
  }.bind(this);

  this.append = function(msg) {
    this.messages.push(msg);
    storage.set(storageId, this.messages.length);
    if (msg.u !== 'lichess') this.unread = true;
    redraw();
  }.bind(this);

  function onKeyboardShow(e) {
    if (window.cordova.platformId === 'ios') {
      let chat = document.getElementById('chat_scroller');
      if (!chat) return;
      chatHeight = chat.offsetHeight;
      chat.style.height = (chatHeight - e.keyboardHeight) + 'px';
    }
  }

  function onKeyboardHide() {
    if (window.cordova.platformId === 'ios') {
      let chat = document.getElementById('chat_scroller');
      if (chat) chat.style.height = chatHeight + 'px';
    }
    var input = document.getElementById('chat_input');
    if (input) input.blur();
  }

  window.addEventListener('native.keyboardhide', onKeyboardHide);
  window.addEventListener('native.keyboardshow', onKeyboardShow);

  this.unload = function() {
    if (!gameApi.playable(this.root.data)) storage.remove(storageId);
    document.removeEventListener('native.keyboardhide', onKeyboardHide);
    document.removeEventListener('native.keyboardshow', onKeyboardShow);
  }.bind(this);
}

function isSpam(txt) {
  return /chess-bot/.test(txt);
}

function compactableDeletedLines(l1, l2) {
  return l1.d && l2.d && l1.u === l2.u;
}

function selectLines(ctrl) {
  var prev, ls = [];
  ctrl.messages.forEach(function(line) {
    if (!line.d &&
      (!prev || !compactableDeletedLines(prev, line)) &&
      (!line.r || ctrl.isShadowban) &&
      !isSpam(line.t)
    ) ls.push(line);
    prev = line;
  });
  return ls;
}

export function chatView(ctrl) {

  if (!ctrl.showing) return null;

  var player = ctrl.root.data.player;

  return m('div#chat.modal', { oncreate: helper.slidesInUp }, [
    m('header', [
      m('button.modal_close[data-icon=L]', {
        oncreate: helper.ontap(helper.slidesOutDown(ctrl.close, 'chat'))
      }),
      m('h2', ctrl.root.data.opponent.user ?
        ctrl.root.data.opponent.user.username : i18n('chat'))
    ]),
    m('div.modal_content', [
      m('div#chat_scroller.native_scroller', {
        oncreate: el => {
          el.scrollTop = el.scrollHeight;
        }
      }, [
        m('ul.chat_messages', selectLines(ctrl).map(function(msg, i, all) {

          var lichessTalking = msg.u === 'lichess';
          var playerTalking = msg.c ? msg.c === player.color :
          player.user && msg.u === player.user.username;

          var closeBalloon = true;
          var next = all[i + 1];
          var nextTalking;
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
        onsubmit: e => {
          e.preventDefault();
          const msg = e.target[0].value.trim();
          if (!msg) return;
          if (msg.length > 140) {
            return;
          }
          ctrl.inputValue = '';
          socket.send('talk', msg);
        }
      }, [
        m('input#chat_input.chat_input[type=text]', {
          placeholder: i18n('talkInChat'),
          autocomplete: 'off',
          value: ctrl.inputValue,
          oncreate: function(vnode) {
            vnode.dom.addEventListener('input', inputListener.bind(undefined, ctrl));
          }
        }),
        m('button.chat_send[data-icon=z]')
      ])
    ])
  ]);
}

function inputListener(ctrl, e) {
  ctrl.inputValue = e.target.value;
}
