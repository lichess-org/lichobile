import game from'./ui/game';
import analyse from './ui/analyse';
import challenge from './ui/challenge';
import tv from'./ui/tv';
import correspondence from'./ui/correspondence';
import otb from'./ui/otb';
import ai from'./ui/ai';
import settingsUi from'./ui/settings';
import settingsLang from './ui/settings/lang';
import settingsPreferences from './ui/settings/preferences';
import settingsGameDisplay from './ui/settings/gameDisplay';
import settingsGameBehavior from './ui/settings/gameBehavior';
import settingsPrivacy from './ui/settings/privacy';
import boardThemes from'./ui/settings/boardThemes';
import pieceThemes from'./ui/settings/pieceThemes';
import user from'./ui/user';
import userGames from'./ui/user/games';
import userVariantPerf from'./ui/user/variantperf';
import userTV from './ui/user/tv';
import players from './ui/players';
import ranking from './ui/players/ranking';
import training from './ui/training';
import tournamentList from'./ui/tournament/list';
import tournament from'./ui/tournament';
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
      '/analyse': analyse,
      '/analyse/:id': analyse,
      '/analyse/:id/user/:userId': analyse,
      '/challenge/:id': challenge,
      '/tv': tv,
      '/correspondence': correspondence,
      '/@/:id': user,
      '/@/:id/games': userGames,
      '/@/:id/games/:filter': userGames,
      '/@/:id/:variant/perf': userVariantPerf,
      '/@/:id/tv': userTV,
      '/editor': editor,
      '/editor/:fen': editor,
      '/players': players,
      '/ranking': ranking,
      '/settings': settingsUi,
      '/settings/preferences': settingsPreferences,
      '/settings/gameDisplay': settingsGameDisplay,
      '/settings/gameBehavior': settingsGameBehavior,
      '/settings/privacy': settingsPrivacy,
      '/settings/themes/board': boardThemes,
      '/settings/themes/piece': pieceThemes,
      '/settings/lang': settingsLang,
      '/training': training,
      '/training/:id': training,
      '/tournament': tournamentList,
      '/tournament/:id': tournament
    });
  }
};
