var session = require('../session');
var utils = require('../utils');
var i18n = require('../i18n');

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
      config: utils.ontouchend(function() {
        session.logout();
      })
    }, i18n('logOut'))
  ] : [
    m('h2', i18n('notConnected'))
  ];
  return [
    m('header', m('nav', nav)),
    m('div',
      userobj ? null :
      m('form', {
        onsubmit: function(e) {
          e.preventDefault();
          var form = e.target;
          menu.toggle();
          session.login(form[0].value, form[1].value);
        }
      }, [
        m('h3', i18n('signIn')),
        m('input#pseudo[type=text][placeholder=' + i18n('username') + '][autocomplete=off][autocapitalize=off][autocorrect=off]'),
        m('input#password[type=password][placeholder=' + i18n('password') + ']'),
        m('button#login', i18n('signIn'))
      ])
    )
  ];
};

module.exports = menu;
