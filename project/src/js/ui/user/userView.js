var utils = require('../../utils');
var widgets = require('../widget/common');
var layout = require('../layout');
var menu = require('../menu');
var helper = require('../helper');

var perfTypes = [
  ['bullet', 'Bullet'],
  ['chess960', 'Chess960'],
  ['blitz', 'Blitz'],
  ['kingOfTheHill', 'King Of The Hill'],
  ['classical', 'Classical'],
  ['threeCheck', 'Three-check'],
  ['correspondence', 'Correspondence'],
  ['antichess', 'Antichess'],
  ['atomic', 'Atomic']
];

function renderPerf(key, name, perf) {
  return m('div.perf', {
    'data-icon': utils.gameIcon(key)
  }, [
    m('span.name', name),
    m('div.rating', [
      perf.rating,
      helper.progress(perf.prog),
      m('span.nb', '/ ' + perf.games)
    ])
  ]);
}

function perfs(user) {
  var res = perfTypes.map(function(p) {
    var perf = user.perfs[p[0]];
    if (perf) return {
      key: p[0],
      name: p[1],
      perf: perf
    };
  }).sort(function(a, b) {
    return a.perf.games < b.perf.games;
  });
  if (user.perfs.puzzle) res.push({
    key: 'puzzle',
    name: 'Training',
    perf: user.perfs.puzzle
  });

  return res;
}

function openPerfs(user) {
  return perfs(user).map(function(p) {
    return renderPerf(p.key, p.name, p.perf);
  });
}

function renderHeader(user) {
  var header = [
    m('h2', user.username),
    m('section', {
      className: 'ratings open',
    }, openPerfs(user))
  ];
  
  return header;
}

function renderProfile(user) {
  return function() {
    return [
      m('div#user_profile',
        m('header.user_profile_header', renderHeader(user))
      )
    ];  
  }
}
  
module.exports = function(ctrl) {
  var user = ctrl.getUserData();
  var header = utils.partialf(widgets.header, null,
      widgets.backButton(user.username ? user.username : '')
    );

  var profile = renderProfile(user);

  return layout.free(header, profile, widgets.empty, menu.view, widgets.empty);
};