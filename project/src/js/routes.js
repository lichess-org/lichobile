var game = require('./ui/game');
var seek = require('./ui/seek');
var seeks = require('./ui/seeks');
var otb = require('./ui/otb');
var ai = require('./ui/ai');
var settingsUi = require('./ui/settings');
var boardThemes = require('./ui/settings/boardThemes');
var pieceThemes = require('./ui/settings/pieceThemes');
var friends = require('./ui/friends');

module.exports.init = function() {
  m.route(document.body, '/', {
    '/': ai,
    '/seeks': seeks,
    '/seek': seek,
    '/otb': otb,
    '/ai': ai,
    '/game/:id': game,
    '/game/:id/:pov': game,
    '/settings': settingsUi,
    '/settings/themes/board': boardThemes,
    '/settings/themes/piece': pieceThemes,
    '/friends': friends
  });
};
