var utils = require('../../utils');
var i18n = require('../../i18n');
var iScroll = require('iscroll');

module.exports = {
  controller: function(root) {

    this.root = root;
    this.showing = false;
    this.messages = root.data.chat || [];
    this.inputValue = '';
    this.unread = false;
    this.scroller = null;

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

    this.append = function(msg) {
      this.messages.push(msg);
      if (msg.u !== 'lichess')
        this.unread = true;
      m.redraw();
      // hack to prevent scrolling to bottom on every redraw
      setTimeout(function() {
        if(this.scroller) this.scroller.scrollTo(0, this.scroller.maxScrollY, 0);
      }.bind(this), 100);
    }.bind(this);

    var scrollerHeight;
    var onKeyboardShow = function(e) {
      this.scroller.scrollTo(0, this.scroller.maxScrollY, 0);
      var chat = document.getElementById('chat_scroller');
      scrollerHeight = chat.offsetHeight;
      chat.style.height = (scrollerHeight - e.keyboardHeight) + 'px';
      setTimeout(function() {
        this.scroller.refresh();
        this.scroller.scrollTo(0, this.scroller.maxScrollY, 0);
      }.bind(this), 100);
    }.bind(this);

    var onKeyboardHide = function() {
      // because of iscroll we need to manually blur when user hide
      // keyboard
      document.getElementById('chat_input').blur();
      var chat = document.getElementById('chat_scroller');
      chat.style.height = scrollerHeight + 'px';
      setTimeout(function() {
        this.scroller.refresh();
      }.bind(this), 100);
    }.bind(this);

    window.addEventListener('native.keyboardhide', onKeyboardHide);
    window.addEventListener('native.keyboardshow', onKeyboardShow);

    this.onunload = function() {
      document.removeEventListener('native.keyboardhide', onKeyboardHide);
      document.removeEventListener('native.keyboardshow', onKeyboardShow);
    };
  },

  view: function(ctrl) {
    var vh = utils.getViewportDims().vh,
      formH = 45,
      scrollerH = vh - formH - 45; // minus modal header height

    return m('div#chat.modal', {
      class: utils.classSet({
        show: ctrl.showing
      })
    }, [
      m('header', [
        m('button.modal_close[data-icon=L]', {
          config: utils.ontouchend(ctrl.close)
        }),
        m('h2', ctrl.root.data.opponent.user ?
          ctrl.root.data.opponent.user.username : i18n('chat'))
      ]),
      m('div.chat_content', [
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
            }
            ctrl.scroller.refresh();
          }
        }, [
          m('ul.chat_messages', ctrl.messages.map(function(msg) {
            var user;
            if (msg.c)
              user = '[' + msg.c + ']';
            else if (msg.u !== 'lichess')
              user = msg.u;
            else
              user = null;

            return m('li.chat_msg', {
              class: utils.classSet({
                system: msg.u === 'lichess',
                'me_talking': msg.c ? msg.c === ctrl.root.data.player.color : msg.u === ctrl.root.data.player.user.username
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
            ctrl.root.socketSend('talk', msg);
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
