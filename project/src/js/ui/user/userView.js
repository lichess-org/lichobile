var utils = require('../../utils');
var widgets = require('../widget/common');
var perf = require('../widget/perf');
var layout = require('../layout');
var menu = require('../menu');
var moment = window.moment;
var i18n = require('../../i18n');
var countries = require('./countries');
var helper = require('../helper');

function renderProfile(user) {
  if (user.profile) {
    var fullname = (user.profile.firstName || user.profile.lastName) ?
      user.profile.firstName + ' ' + user.profile.lastName :
      '';

    var country = countries[user.profile.country];
    var location = user.profile.location;
    var locationString = '';
    if (location) locationString += location;
    if (country) locationString += (location ? ', ' : '') + country;

    return m('div.profile', [
      m('h3.fullname', fullname),
      m('br'),
      m('p.bio', m('em', user.profile.bio)),
      m('br'),
      m('p.location', locationString)
    ]);
  } else
    return null;
}

function renderHeader(user) {
  return [
    m('div.userInfos', [
      renderProfile(user),
      m('p.memberSince', i18n('memberSince') + ' ' + moment(user.createdAt).format('LL')),
      user.seenAt ?
        m('p.lastSeen', i18n('lastLogin') + ' ' + moment(user.seenAt).format('LLL')) :
        null,
      m('br'),
      user.playTime ? [
        m('p.playTime', 'Time spent playing: ' + moment.duration(user.playTime.total, 'seconds').humanize()),
        user.playTime.tv > 0 ? m('p.onTv', 'Time on TV: ' + moment.duration(user.playTime.tv, 'seconds').humanize()) : null
      ] : null
    ])
  ];
}

function renderRatings(user) {
  return utils.userPerfs(user).map(p => {
    return perf(p.key, p.name, p.perf);
  });
}

function renderActions(user) {
  return [
    m('button.profileButton', {
      config: helper.ontouchendScrollY(() => {
        m.route('/@/' + user.username + '/games');
      })
    }, 'See ' + user.username + '\'s games')
  ];
}

module.exports = function(ctrl) {
  var user = ctrl.getUserData();
  console.log(user);
  var header = utils.partialf(widgets.header, null,
    widgets.backButton(user.username)
  );

  var profile = function() {
    return m('div.native_scroller', [
      m('div#user_profile',
        m('header.user_profile_header', renderHeader(user)),
        m('section.ratings.profile', renderRatings(user)),
        m('br'),
        m('br'),
        m('section#userProfileActions', renderActions(user))
      )
    ]);
  };

  return layout.free(header, profile, widgets.empty, menu.view, widgets.empty);
};
