var utils = require('../../utils');
var i18n = require('../../i18n');

module.exports = {
  controller: function(root) {

    this.root = root;
    this.showing = false;
    this.messages = root.data.chat || [];
    this.inputValue = '';
    this.unread = false;

    this.open = function() {
      this.showing = true;
    }.bind(this);

    this.close = function() {
      this.showing = false;
      this.unread = false;
    }.bind(this);

    this.append = function(msg) {
      this.messages.push(msg);
      this.unread = true;
      m.redraw();
    }.bind(this);
  },

  view: function(ctrl) {
    return m('div#chat.modal', {
      class: utils.classSet({
        show: ctrl.showing
      })
    }, [
      m('header', [
        m('button.modal_close[data-icon=L]', {
          config: utils.ontouchend(ctrl.close)
        }),
        m('h2', i18n('chat'))
      ]),
      m('div.chat_content', [
        m('div.chat_messages', {
          config: function(el) {
            el.scrollTop = 999999;
          }
        }, ctrl.messages.map(function(msg) {
          var user;
          if (msg.c)
            user = '[' + msg.c + ']';
          else if (msg.u !== 'lichess')
            user = msg.u;
          else
            user = null;

          return m('div.chat_msg', {
            class: utils.classSet({
              system: msg.u === 'lichess'
            })
          }, [
            m('span.chat_user', user),
            m.trust(msg.t)
          ]);
        })),
        m('form.chat_form', {
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
          m('input.chat_input[type=text][placeholder=' + i18n('talkInChat') + ']', {
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
