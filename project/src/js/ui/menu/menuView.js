/** @jsx m */
var session = require('../../session');
var loginModal = require('../loginModal');
var newGameForm = require('../newGameForm');
var challengeForm = require('../challengeForm');
var i18n = require('../../i18n');
var utils = require('../../utils');
var friends = require('../../friends');
var helper = require('../helper');
var iScroll = require('iscroll');

var menu = require('./menu');

function renderHeader(user) {
  var header = user ? [
    m('div.logo'),
    m('h2.username', user.username),
    m('button.open_button[data-icon=u]', {
      className: menu.headerOpen() ? 'open' : '',
      config: helper.ontouchend(menu.toggleHeader)
    })
  ] : [
    m('div.logo'),
    m('h2.username', 'Anonymous'),
    m('button.login', {
      config: helper.ontouchendScrollY(loginModal.open)
    }, i18n('signIn'))
  ];

  return header;
}

function renderProfileActions(user) {
  return (
    <ul className="side_links profileActions">
      <li className="side_link" config={helper.ontouchend(menu.route('/@/' + user.id))}>
        <span data-icon="r" />
        {i18n('profile')}
      </li>
      <li className="side_link" config={helper.ontouchend(menu.route('/friends'))}>
        <span data-icon="f" />
        {i18n('onlineFriends') + ' (' + friends.count() + ')' }
      </li>
      <li className="side_link" config={helper.ontouchend(() => {
        session.logout();
        menu.headerOpen(false);
      })}>
        <span data-icon="w" />
        {i18n('logOut')}
      </li>
    </ul>
  );
}

function renderLinks(user) {
  return m('ul.side_links', [
    utils.hasNetwork() ? m('li.sep_link', {
      key: 'sep_link_online'
    }, i18n('playOnline')) : null,
    utils.hasNetwork() ? m('li.side_link', {
      key: 'play_real_time',
      config: helper.ontouchendScrollY(menu.popup(newGameForm.openRealTime))
    }, [m('span.fa.fa-plus-circle'), i18n('createAGame')]) : null, (utils.hasNetwork() && user) ? m('li.side_link', {
      key: 'seeks',
      config: helper.ontouchendScrollY(menu.route('/seeks'))
    }, [m('span.fa.fa-paper-plane'), i18n('correspondence')]) : null,
    utils.hasNetwork() ? m('li.side_link', {
      key: 'invite_friend',
      config: helper.ontouchendScrollY(menu.popup(challengeForm.open))
    }, [m('span.fa.fa-share-alt'), i18n('playWithAFriend')]) : null,
    utils.hasNetwork() ? m('li.side_link', {
      key: 'tv',
      config: helper.ontouchendScrollY(menu.route('/tv'))
    }, [m('span[data-icon=1]'), i18n('watchLichessTV')]) : null,
    m('li.sep_link', {
      key: 'sep_link_offline'
    }, i18n('playOffline')),
    m('li.side_link', {
      key: 'play_ai',
      config: helper.ontouchendScrollY(menu.route('/ai'))
    }, [m('span.fa.fa-cogs'), i18n('playOfflineComputer')]),
    m('li.side_link', {
      key: 'play_otb',
      config: helper.ontouchendScrollY(menu.route('/otb'))
    }, [m('span.fa.fa-beer'), i18n('playOnTheBoardOffline')]),
    m('li.hr', {
      key: 'sep_link_settings'
    }),
    m('li.side_link', {
      key: 'settings',
      config: helper.ontouchendScrollY(menu.route('/settings'))
    }, [m('span.fa.fa-cog'), i18n('settings')])
  ]);
}

module.exports = function() {
  var user = session.get();
  return m('aside#side_menu', {
    className: menu.isOpen ? 'in' : 'out',
    config: function(el, isUpdate, context) {
      if (!isUpdate) {
        context.scroller = new iScroll(el);
        context.onunload = function() {
          if (context.scroller) {
            context.scroller.destroy();
            context.scroller = null;
          }
        };
      }
      context.scroller.refresh();
    }
  }, m('div.scroller', [
    m('header.side_menu_header', renderHeader(user)),
    user && menu.headerOpen() ? renderProfileActions(user) : renderLinks(user)
  ]));
};
