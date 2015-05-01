var utils = require('../../utils');
var widgets = require('../widget/common');
var perf = require('../widget/perf');
var layout = require('../layout');
var menu = require('../menu');

function renderHeader(user) {
  var fullname = (user.profile.firstName || user.profile.lastName) ?
    user.profile.firstName + ' ' + user.profile.lastName :
    '';

  var header = [
    m('div.profile_bio', [
      m('h3.fullname', fullname),
      m('p.bio', m('em', user.profile.bio)),
      m('p.location', user.profile.location)
    ])
  ];

  return header;
}

function renderRatings(user) {
  return utils.userPerfs(user).map(function(p) {
    return perf(p.key, p.name, p.perf);
  });
}

module.exports = function(ctrl) {
  var user = ctrl.getUserData();
  var header = utils.partialf(widgets.header, null,
      widgets.backButton(user.username ? user.username : '')
    );

  var profile = function() {
    return [
      m('div#user_profile',
        m('header.user_profile_header', renderHeader(user)),
        m('section.ratings.profile', renderRatings(user))
      )
    ];
  };

  return layout.free(header, profile, widgets.empty, menu.view, widgets.empty);
};
