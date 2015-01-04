var utils = require('../../utils');
var i18n = require('../../i18n');

module.exports = {
  controller: function(root) {

    this.root = root;
    this.showing = false;
    this.messages = root.data.chat || [];
    this.inputValue = '';

    this.append = function(msg) {
      this.messages.push(msg);
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
          config: utils.ontouchend(function() {
            ctrl.showing = false;
          })
        }),
        m('h2', i18n('chat'))
      ]),
      m('div.chat_content', [
        m('div.chat_messages', {
          config: function(el) {
            el.scrollTop = 999999;
          }
        }, ctrl.messages.map(function(msg) {
          return m('div.chat_msg', [
            m('span.chat_user', msg.u),
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
