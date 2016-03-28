import helper from '../helper';
import i18n from '../../i18n';
import storage from '../../storage';
import gameApi from '../../lichess/game';
import backbutton from '../../backbutton';
import socket from '../../socket';
import m from 'mithril';

export default {
  controller: function(root) {

    const storageId = 'chat.' + root.data.game.id;

    let chatHeight;

    this.root = root;
    this.showing = false;
    this.messages = root.data.chat || [];
    this.inputValue = '';
    this.unread = false;

    var checkUnreadFromStorage = function() {
      var nbMessages = storage.get(storageId);
      if (nbMessages < this.messages.length) this.unread = true;
    }.bind(this);

    checkUnreadFromStorage();
    storage.set(storageId, this.messages.length);

    this.open = function() {
      backbutton.stack.push(helper.slidesOutDown(this.close, 'chat'));
      this.showing = true;
    }.bind(this);

    this.close = function(fromBB) {
      window.cordova.plugins.Keyboard.close();
      if(fromBB !== 'backbutton' && this.showing) backbutton.stack.pop();
      this.showing = false;
      this.unread = false;
    }.bind(this);

    this.onReload = function(messages) {
      this.messages = messages;
      checkUnreadFromStorage();
      storage.set(storageId, this.messages.length);
    }.bind(this);

    this.append = function(msg) {
      this.messages.push(msg);
      storage.set(storageId, this.messages.length);
      if (msg.u !== 'lichess') this.unread = true;
      m.redraw();
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

    this.onunload = function() {
      if (!gameApi.playable(this.root.data)) storage.remove(storageId);
      document.removeEventListener('native.keyboardhide', onKeyboardHide);
      document.removeEventListener('native.keyboardshow', onKeyboardShow);
    }.bind(this);
  },

  view: function(ctrl) {

    if (!ctrl.showing) return null;

    return m('div#chat.modal', { config: helper.slidesInUp }, [
      m('header', [
        m('button.modal_close[data-icon=L]', {
          config: helper.ontouch(helper.slidesOutDown(ctrl.close, 'chat'))
        }),
        m('h2', ctrl.root.data.opponent.user ?
          ctrl.root.data.opponent.user.username : i18n('chat'))
      ]),
      m('div.modal_content', [
        m('div#chat_scroller.native_scroller', {
          config: el => el.scrollTop = el.scrollHeight
        }, [
          m('ul.chat_messages', ctrl.messages.map(function(msg, i, all) {
            var player = ctrl.root.data.player;

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
            }, [
              m.trust(msg.t)
            ]);
          }))
        ]),
        m('form.chat_form', {
          onsubmit: function(e) {
            e.preventDefault();
            var msg = e.target[0].value.trim();
            if (!msg) return false;
            if (msg.length > 140) {
              return false;
            }
            ctrl.inputValue = '';
            socket.send('talk', msg);
          }
        }, [
          m('input#chat_input.chat_input[type=text][placeholder=' + i18n('talkInChat') + ']', {
            value: ctrl.inputValue,
            config: function(el, isUpdate) {
              if (!isUpdate) {
                el.addEventListener('input', inputListener.bind(undefined, ctrl));
              }
            }
          }),
          m('button.chat_send[data-icon=z]')
        ])
      ])
    ]);
  }
};

function inputListener(ctrl, e) {
  ctrl.inputValue = e.target.value;
}
