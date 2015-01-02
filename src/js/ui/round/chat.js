var utils = require('../../utils');
var i18n = require('../../i18n');

module.exports = {
  view: function(ctrl) {
    return m('div#chat', {
      class: utils.classSet({
        show: ctrl.vm.showingChatWindow
      })
    }, [
      m('header', [
        m('h2', i18n('chat'))
      ]),
      m('button.chat-close[data-icon=L]', {
        config: utils.ontouchend(function() {
          ctrl.vm.showingChatWindow = false;
        })
      }),
      m('div.chat_content', [
        m('div.chat_messages', [
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
          m('div.chat_msg', [m('span.chat_user', 'veloce'), 'bluk asdf sdfdsfkdlsfkafasdfasdfhadsfsdfkdf']),
        ]),
        m('input.chat_input[type=text][placeholder=chat here...]')
      ])
    ]);
  }
};
