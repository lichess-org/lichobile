var utils = require('../../utils');
var i18n = require('../../i18n');

module.exports = {
  controller: function(messages) {
    this.showing = false;

    this.messages = messages || [];

    // this.messages = [
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false },
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false },
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false },
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false },
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false },
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false },
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false },
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false },
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false },
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false },
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false },
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false },
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false },
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false },
    //   { u: 'veloce', t: 'bla bla fhadsdf asasdkfj asdfa;slkdfjasdlkf jasdf a;k', r: false }
    // ];

    this.append = function(msg) {
      this.messages.push(msg);
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
          style: { height: heights.messages + 'px' }
        }, ctrl.messages.map(function(msg) {
          return m('div.chat_msg', [
            m('span.chat_user', msg.u),
            msg.t
          ]);
        })),
        m('input.chat_input[type=text][placeholder=chat here...]', {
          style: { height: heights.input + 'px' }
        })
      ])
    ]);
  }
};
