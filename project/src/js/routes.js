var game = require('./ui/game');
var tv = require('./ui/tv');
var seek = require('./ui/seek');
var seeks = require('./ui/seeks');
var otb = require('./ui/otb');
var ai = require('./ui/ai');
var settingsUi = require('./ui/settings');
var boardThemes = require('./ui/settings/boardThemes');
var pieceThemes = require('./ui/settings/pieceThemes');
var friends = require('./ui/friends');
var user = require('./ui/user');

module.exports.init = function() {
  m.route(document.body, '/', {
    '/': ai,
    '/seeks': seeks,
    '/seek': seek,
    '/otb': otb,
    '/ai': ai,
    '/game/:id': game,
    '/game/:id/:color': game,
    '/tv': tv,
    '/settings': settingsUi,
    '/settings/themes/board': boardThemes,
    '/settings/themes/piece': pieceThemes,
    '/friends': friends,
    '/@/:id': user
  });
};
