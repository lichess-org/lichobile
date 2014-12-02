var session = require('./session');
var utils = require('./utils');

var menu = {};

menu.isOpen = false;

menu.toggle = function() {
  menu.isOpen = !menu.isOpen;
};

menu.view = function() {
  var userobj = session.get();
  var nav = userobj ? [
    m('h2', userobj.username),
    m('button', {
      config: utils.ontouchstart(function() {
        session.logout();
      })
    }, 'Log out')
  ] : [
    m('h2', 'Not connected')
  ];
  return [
    m('header', [
      m('nav', nav)
    ]),
    m('div', [
      userobj ? null :
      m('form', {
        onsubmit: function(e) {
          e.preventDefault();
          var form = e.target;
          menu.toggle();
          session.login(form[0].value, form[1].value);
        }
      },[
        m('h3', 'Connection'),
        m('input#pseudo[type=text][placeholder=Pseudo]'),
        m('input#password[type=password][placeholder=Password]'),
        m('button#login', 'LOG IN')
      ])
    ])
  ];
};

module.exports = menu;
