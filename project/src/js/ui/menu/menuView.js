/** @jsx m */
var session = require('../../session');
var loginModal = require('../loginModal');
var newGameForm = require('../newGameForm');
var challengeForm = require('../challengeForm');
var i18n = require('../../i18n');
var utils = require('../../utils');
var friends = require('../../lichess/friends');
var helper = require('../helper');
var iScroll = require('iscroll');

var menu = require('./menu');

function renderHeader(user) {
  if (utils.hasNetwork())
    return user ? [
      m('div.logo'),
      m('h2.username', user.username),
      m('button.open_button[data-icon=u]', {
        className: menu.headerOpen() ? 'open' : '',
        config: helper.ontouch(menu.toggleHeader)
      })
    ] : [
      m('div.logo'),
      m('h2.username', 'Anonymous'),
      m('button.login', {
        config: helper.ontouchY(loginModal.open)
      }, i18n('signIn'))
    ];
  else
    return [
      m('div.logo'),
      m('h2.username', 'Offline')
    ];
}

function renderProfileActions(user) {
  return (
    <ul className="side_links profileActions">
      <li className="side_link" config={helper.ontouch(menu.route('/@/' + user.id))}>
        <span data-icon="r" />
        {i18n('profile')}
      </li>
      <li className="side_link" config={helper.ontouch(menu.route('/friends'))}>
        <span data-icon="f" />
        {i18n('onlineFriends') + ' (' + friends.count() + ')' }
      </li>
      <li className="side_link" config={helper.ontouch(() => {
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
  return (
    <ul className="side_links">
      {helper.cond(utils.hasNetwork(),
      <li className="sep_link" key="sep_link_online">{i18n('playOnline')}</li>
      )}
      {helper.cond(utils.hasNetwork(),
      <li className="side_link" key="play_real_time" config={helper.ontouchY(menu.popup(newGameForm.openRealTime))}>
        <span className="fa fa-plus-circle"/>{i18n('createAGame')}
      </li>
      )}
      {helper.cond(utils.hasNetwork() && user,
      <li className="side_link" key="seeks" config={helper.ontouchY(menu.route('/seeks'))}>
        <span className="fa fa-paper-plane" />{i18n('correspondence')}
      </li>
      )}
      {helper.cond(utils.hasNetwork(),
      <li className="side_link" key="invite_friend" config={helper.ontouchY(menu.popup(challengeForm.open))}>
        <span className="fa fa-share-alt"/>{i18n('playWithAFriend')}
      </li>
      )}
      {helper.cond(utils.hasNetwork(),
      <li className="side_link" key="tv" config={helper.ontouchY(menu.route('/tv'))}>
        <span data-icon="1"/>{i18n('watchLichessTV')}
      </li>
      )}
      {helper.cond(utils.hasNetwork(),
      <li className="sep_link" key="sep_link_community">
        {i18n('community')}
      </li>
      )}
      {helper.cond(utils.hasNetwork(),
      <li className="side_link" key="players" config={helper.ontouchY(menu.route('/players'))}>
        <span className="fa fa-search"/>{i18n('players')}
      </li>
      )}
      <li className="sep_link" key="sep_link_offline">
        {i18n('playOffline')}
      </li>
      <li className="side_link" key="play_ai" config={helper.ontouchY(menu.route('/ai'))}>
        <span className="fa fa-cogs"/>{i18n('playOfflineComputer')}
      </li>
      <li className="side_link" key="play_otb" config={helper.ontouchY(menu.route('/otb'))}>
        <span className="fa fa-beer"/>{i18n('playOnTheBoardOffline')}
      </li>
      <li className="hr" key="sep_link_settings"></li>
      <li className="side_link" key="settings" config={helper.ontouchY(menu.route('/settings'))}>
        <span className="fa fa-cog"/>{i18n('settings')}
      </li>
    </ul>
  );
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
