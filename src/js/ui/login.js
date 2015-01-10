var layout = require('./layout');
var menu = require('./menu');
var widgets = require('./_commonWidgets');
var gamesMenu = require('./gamesMenu');
var session = require('../session');
var utils = require('../utils');
var i18n = require('../i18n');

module.exports = {
  controller: function() {},

  view: function() {
    function content() {
      return m('section.content', [
        m('form#login_form', {
          onsubmit: function(e) {
            e.preventDefault();
            var form = e.target;
            var login = form[0].value.trim();
            var pass = form[1].value.trim();
            if (!login || !pass) return false;
            window.cordova.plugins.Keyboard.close();
            session.login(form[0].value.trim(), form[1].value.trim()).then(function() {
              m.route('/');
            }, function(err) {
              utils.handleXhrError(err);
            });
          }
        }, [
          m('h2', i18n('signIn')),
          m('input#pseudo[type=text][placeholder=' + i18n('username') + '][autocomplete=off][autocapitalize=off][autocorrect=off][required]'),
          m('input#password[type=password][placeholder=' + i18n('password') + '][required]'),
          m('button.login', i18n('signIn'))
        ])
      ]);
    }

    function overlays() {
      return [
        gamesMenu.view()
      ];
    }

    return layout.base(widgets.header, content, widgets.empty, menu.view, overlays);
  }
};
