var home = require('./ui/home');
var play = require('./ui/play');
var seek = require('./ui/seek');
var seeks = require('./ui/seeks');
var otb = require('./ui/otb/main');
var ai = require('./ui/ai/main');
var settingsUi = require('./ui/settings');
var boardThemes = require('./ui/settings/boardThemes');
var pieceThemes = require('./ui/settings/pieceThemes');

module.exports.init = function() {
  m.route(document.body, '/', {
    '/': home,
    '/seeks': seeks,
    '/seek': seek,
    '/otb': otb,
    '/ai': ai,
    '/play/:id': play,
    '/play/:id/:pov': play,
    '/settings': settingsUi,
    '/settings/themes/board': boardThemes,
    '/settings/themes/piece': pieceThemes
  });
};
