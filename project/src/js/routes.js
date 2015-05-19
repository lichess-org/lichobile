import game from'./ui/game';
import tv from'./ui/tv';
import seek from'./ui/seek';
import seeks from'./ui/seeks';
import otb from'./ui/otb';
import ai from'./ui/ai';
import settingsUi from'./ui/settings';
import boardThemes from'./ui/settings/boardThemes';
import pieceThemes from'./ui/settings/pieceThemes';
import friends from'./ui/friends';
import user from'./ui/user';
import userGames from'./ui/user/games';
import players from './ui/players';

module.exports.init = function() {
  m.route(document.body, '/', {
    '/': ai,
    '/otb': otb,
    '/ai': ai,
    '/game/:id': game,
    '/game/:id/:color': game,
    '/game/:id/user/:userId': game,
    '/tv': tv,
    '/seek': seek,
    '/seeks': seeks,
    '/friends': friends,
    '/@/:id': user,
    '/@/:id/games': userGames,
    '/@/:id/games/:filter': userGames,
    '/players': players,
    '/settings': settingsUi,
    '/settings/themes/board': boardThemes,
    '/settings/themes/piece': pieceThemes
  });
};
