import game from'./ui/game';
import tv from'./ui/tv';
import correspondence from'./ui/correspondence';
import otb from'./ui/otb';
import ai from'./ui/ai';
import settingsUi from'./ui/settings';
import settingsLang from './ui/settings/lang';
import settingsGameDisplay from './ui/settings/gameDisplay';
import settingsGameBehavior from './ui/settings/gameBehavior';
import boardThemes from'./ui/settings/boardThemes';
import pieceThemes from'./ui/settings/pieceThemes';
import user from'./ui/user';
import userGames from'./ui/user/games';
import userTV from './ui/user/tv';
import players from './ui/players';
import ranking from './ui/players/ranking';
import training from './ui/training';
import editor from './ui/editor';
import m from 'mithril';

export default {
  init() {
    m.route(document.body, '/', {
      '/': ai,
      '/otb': otb,
      '/ai': ai,
      '/game/:id': game,
      '/game/:id/:color': game,
      '/game/:id/user/:userId': game,
      '/tv': tv,
      '/correspondence': correspondence,
      '/@/:id': user,
      '/@/:id/games': userGames,
      '/@/:id/games/:filter': userGames,
      '/@/:id/tv': userTV,
      '/editor': editor,
      '/editor/:fen': editor,
      '/players': players,
      '/ranking': ranking,
      '/settings': settingsUi,
      '/settings/gameDisplay': settingsGameDisplay,
      '/settings/gameBehavior': settingsGameBehavior,
      '/settings/themes/board': boardThemes,
      '/settings/themes/piece': pieceThemes,
      '/settings/lang': settingsLang,
      '/training': training,
      '/training/:id': training
    });
  }
};
