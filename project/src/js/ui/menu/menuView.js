var session = require('../../session');
var loginModal = require('../loginModal');
var newGameForm = require('../newGameForm');
var inviteForm = require('../inviteForm');
var i18n = require('../../i18n');
var utils = require('../../utils');
var helper = require('../helper');
var perf = require('../widget/perf');
var iScroll = require('iscroll');

var menu = require('./menu');

var perfsOpen = m.prop(false);

function openPerfs(user) {
  return utils.userPerfs(user).map(function(p) {
    return perf(p.key, p.name, p.perf);
  });
}

function closedPerfs(user) {
  return utils.userPerfs(user).slice(0, 2).map(function(p) {
    return perf(p.key, p.name, p.perf);
  });
}

function renderHeader(user) {
  var header = user ? [
    m('h2', user.username),
    m('section', {
      className: 'ratings ' + (perfsOpen() ? 'open' : 'closed'),
      config: helper.ontouchendScrollY(function() {
        perfsOpen(!perfsOpen());
      })
    }, perfsOpen() ? openPerfs(user) : closedPerfs(user))
  ] : [
    m('h2', 'Anonymous'),
    m('button.login', {
      config: helper.ontouchendScrollY(loginModal.open)
    }, i18n('signIn'))
  ];
  header.unshift(
    m('div.logo', [
      user ? m('button.logout[data-icon=w]', {
        config: helper.ontouchend(session.logout)
      }) : null
    ])
  );

  return header;
}

function renderLinks(user) {
  var links = [
    utils.hasNetwork() ? m('li.sep_link', {
      key: 'sep_link_online'
    }, i18n('playOnline')) : null,
    utils.hasNetwork() ? m('li.side_link', {
      key: 'play_real_time',
      config: helper.ontouchendScrollY(menu.openLink(newGameForm.openRealTime))
    }, [m('span.fa.fa-plus-circle'), i18n('createAGame')]) : null, (utils.hasNetwork() && user) ? m('li.side_link', {
      key: 'seeks',
      config: helper.ontouchendScrollY(menu.menuRouteAction('/seeks'))
    }, [m('span.fa.fa-paper-plane'), i18n('correspondence')]) : null,
    utils.hasNetwork() ? m('li.side_link', {
      key: 'invite_friend',
      config: helper.ontouchendScrollY(menu.openLink(inviteForm.open))
    }, [m('span.fa.fa-share-alt'), i18n('playWithAFriend')]) : null,
    utils.hasNetwork() ? m('li.side_link', {
      key: 'tv',
      config: helper.ontouchendScrollY(menu.menuRouteAction('/tv'))
    }, [m('span[data-icon=1]'), i18n('watchLichessTV')]) : null,
    m('li.sep_link', {
      key: 'sep_link_offline'
    }, i18n('playOffline')),
    m('li.side_link', {
      key: 'play_ai',
      config: helper.ontouchendScrollY(menu.menuRouteAction('/ai'))
    }, [m('span.fa.fa-cogs'), i18n('playOfflineComputer')]),
    m('li.side_link', {
      key: 'play_otb',
      config: helper.ontouchendScrollY(menu.menuRouteAction('/otb'))
    }, [m('span.fa.fa-beer'), i18n('playOnTheBoardOffline')]),
    m('li.hr', {
      key: 'sep_link_settings'
    }),
    m('li.side_link', {
      key: 'settings',
      config: helper.ontouchendScrollY(menu.menuRouteAction('/settings'))
    }, [m('span.fa.fa-cog'), i18n('settings')])
  ];

  return links;
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
    m('nav#side_links', m('ul', renderLinks(user)))
  ]));
};
