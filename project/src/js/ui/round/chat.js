var utils = require('../../utils');
var i18n = require('../../i18n');
var iScroll = require('iscroll');
var storage = require('../../storage');

module.exports = {
  controller: function(root) {

    var storageId = 'games.' + root.data.game.id + '.chat';

    this.root = root;
    this.showing = false;
    this.messages = root.data.chat || [];
    this.inputValue = '';
    this.unread = false;
    this.scroller = null;
    this.scrollerHeight = 0;

    var checkUnreadFromStorage = function() {
      var nbMessages = storage.get(storageId);
      if (nbMessages && nbMessages < this.messages.length) this.unread = true;
    }.bind(this);

    checkUnreadFromStorage();
    storage.set(storageId, this.messages.length);

    // this.messages = [
    //   { c: 'white', t: 'lorde yaya lorde lorde' },
    //   { c: 'white', t: 'lorde yaya lorde lorde, yayyayayaya lorde lorde yayaya!' },
    //   { u: 'lichess', t: 'lichess talking' },
    //   { u: 'lichess', t: 'lichess talking' },
    //   { c: 'black', t: 'lorde yaya lorde lorde' },
    //   { c: 'black', t: 'lorde yaya lorde lorde, yayyayayaya lorde' },
    //   { c: 'white', t: 'lorde yaya lorde lorde' },
    //   { c: 'black', t: 'lorde yaya lorde lorde, yayyayayaya' },
    //   { u: 'lichess', t: 'lichess talking' },
    //   { c: 'black', t: 'lorde yaya ' },
    //   { c: 'black', t: 'lorde yaya lorde lorde' },
    //   { c: 'black', t: 'lorde yaya lorde lorde' },
    //   { c: 'black', t: 'lorde ' },
    //   { c: 'white', t: 'lorde yaya ' },
    //   { c: 'white', t: 'lorde yaya lorde lorde, yayyayayaya lorde lorde yayaya!' }
    // ];

    this.open = function() {
      this.showing = true;
      setTimeout(function() {
        if (this.scroller) this.scroller.scrollTo(0, this.scroller.maxScrollY, 0);
      }.bind(this), 200);
    }.bind(this);

    this.close = function() {
      window.cordova.plugins.Keyboard.close();
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
      // hack to prevent scrolling to bottom on every redraw
      setTimeout(function() {
        if (this.scroller) this.scroller.scrollTo(0, this.scroller.maxScrollY, 0);
      }.bind(this), 100);
    }.bind(this);


    var onKeyboardShow = function(e) {
      var self = this;
      var chat = document.getElementById('chat_scroller');
      // TODO: this is a temporary hack: ionic plugin doesn't return good keyboard
      // size because it doesn't include statusbar height
      var statusBarHeight = (window.cordova.platformId === 'android') ? 25 : 0;
      chat.style.height = (this.scrollerHeight - (e.keyboardHeight - statusBarHeight)) + 'px';
      setTimeout(function() {
        if (self.scroller) self.scroller.refresh();
        if (self.scroller) self.scroller.scrollTo(0, self.scroller.maxScrollY, 0);
      }, 200);
    }.bind(this);

    var onKeyboardHide = function() {
      var self = this;
      // because of iscroll we need to manually blur when user hide
      // keyboard
      document.getElementById('chat_input').blur();
      var chat = document.getElementById('chat_scroller');
      chat.style.height = this.scrollerHeight + 'px';
      setTimeout(function() {
        if (self.scroller) self.scroller.refresh();
      }, 200);
    }.bind(this);

    window.addEventListener('native.keyboardhide', onKeyboardHide);
    window.addEventListener('native.keyboardshow', onKeyboardShow);

    this.onunload = function() {
      document.removeEventListener('native.keyboardhide', onKeyboardHide);
      document.removeEventListener('native.keyboardshow', onKeyboardShow);
    };
  },

  view: function(ctrl) {

    if (!ctrl.showing) return m('div#chat.modal');

    var vh = utils.getViewportDims().vh,
      formH = 45,
      scrollerH = vh - formH - 45; // minus modal header height

    return m('div#chat.modal.show', [
      m('header', [
        m('button.modal_close[data-icon=L]', {
          config: utils.ontouchend(ctrl.close)
        }),
        m('h2', ctrl.root.data.opponent.user ?
          ctrl.root.data.opponent.user.username : i18n('chat'))
      ]),
      m('div.modal_content', [
        m('div#chat_scroller.chat_scroller', {
          style: {
            height: scrollerH + 'px'
          },
          config: function(el, isUpdate, context) {
            if (!isUpdate) {
              ctrl.scroller = new iScroll(el);
              context.onunload = function() {
                if (ctrl.scroller) {
                  ctrl.scroller.destroy();
                  ctrl.scroller = null;
                }
              };
              ctrl.scroller.scrollTo(0, ctrl.scroller.maxScrollY, 0);
              ctrl.scrollerHeight = el.offsetHeight;
            }
            ctrl.scroller.refresh();
          }
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

            return m('li.chat_msg', {
              class: utils.classSet({
                system: lichessTalking,
                player: playerTalking,
                opponent: !lichessTalking && !playerTalking,
                'close_balloon': closeBalloon
              })
            }, [
              m.trust(msg.t)
            ]);
          })),
        ]),
        m('form.chat_form', {
          style: {
            height: formH + 'px'
          },
          onsubmit: function(e) {
            e.preventDefault();
            var msg = e.target[0].value.trim();
            if (!msg) return false;
            if (msg.length > 140) {
              return false;
            }
            ctrl.inputValue = '';
            ctrl.root.socket.send('talk', msg);
          }
        }, [
          m('input#chat_input.chat_input[type=text][placeholder=' + i18n('talkInChat') + ']', {
            value: ctrl.inputValue,
            config: function(el, isUpdate, context) {
              if (!isUpdate) {
                el.addEventListener('input', function(e) {
                  ctrl.inputValue = e.target.value;
                });
                context.onunload = function() {
                  el.removeEventListener('input');
                };
              }
            }
          }),
          m('button.chat_send[data-icon=z]')
        ])
      ])
    ]);
  }
};
