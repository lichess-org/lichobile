'use strict';

var $ = require('./utils').$;
var Handlebars = require('handlebars');
var Zepto = require('./vendor/zepto');

var form = $('#chat > .talk-form'),
input = $('#chat .talk-input'),
messages = $('#chat > .messages');

// msg is escaped server side
var source = '<p class="chat-message"><span class="chat-user">{{ user }}</span>{{{ msg }}}</p>';
var msgTemplate = Handlebars.compile(source);

Zepto('#chatModal .icon-close').tap(function (e) {
  e.preventDefault();
  $('#chat-icon').classList.remove('active');
});

function Chat(socket) {
  messages.innerHTML = '';
  $('#chat-icon').style.display = 'table-cell';

  form.addEventListener('submit', function () {
    var msg = input.value.trim();
    if (!msg) return false;
    if (msg.length > 140) {
      return false;
    }
    input.value = '';
    socket.send('talk', msg);
    return false;
  });

  function append(msg) {
    var rendered = Zepto(msgTemplate({ user: msg.u, msg: msg.t }));
    Zepto(messages).append(rendered);
    $('#chat-icon').classList.add('active');
  }

  return {
    append: append
  };
}

module.exports = Chat;
