var utils = require('../../utils');
var i18n = require('../../i18n');

module.exports = {
  controller: function(root) {
    this.showing = false;

    this.root = root;

    this.messages = root.data.chat || [];

    this.append = function(msg) {
      this.messages.push(msg);
      m.redraw();
    }.bind(this);
  },

  view: function(ctrl) {
    var vh = utils.getViewportDims().vh;
    var heights = {
      header: 50,
      input: 50,
      content: vh - 50,
      messages: vh - 100
    };
    return m('div#chat', {
      style: { height: vh + 'px' },
      class: utils.classSet({
        show: ctrl.showing
      })
    }, [
      m('header', {
        style: { height: heights.header + 'px' }
      }, [
        m('h2', i18n('chat'))
      ]),
      m('button.chat-close[data-icon=L]', {
        config: utils.ontouchend(function() {
          ctrl.showing = false;
        })
      }),
      m('div.chat_content', {
        style: { height: heights.content + 'px' }
      }, [
        m('div.chat_messages', {
          style: { height: heights.messages + 'px' },
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
            ctrl.root.socket.send('talk', msg);
          }
        }, [
          m('input.chat_input[type=text][placeholder=chat here...]', {
            style: { height: heights.input + 'px' },
            value: ''
          }),
          m('button.chat_send[data-icon=z]')
        ])
      ])
    ]);
  }
};
