import helper from './ui/helper';
import home from './ui/home';
import game from './ui/game';
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
import userFollowing from './ui/user/following';
import userFollowers from './ui/user/followers';
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

const slidingPage = helper.slidingPage;

export default {
  init() {
    m.route(document.body, '/', {
      '/': home,
      '/otb': otb,
      '/ai': ai,
      '/game/:id': game,
      '/game/:id/:color': slidingPage(game),
      '/analyse': analyse,
      '/analyse/fen/:fen': analyse,
      '/analyse/:source/:id': slidingPage(analyse),
      '/analyse/:source/:id/:color': slidingPage(analyse),
      '/challenge/:id': challenge,
      '/tv': tv,
      '/correspondence': correspondence,
      '/@/:id': slidingPage(user),
      '/@/:id/following': userFollowing,
      '/@/:id/followers': userFollowers,
      '/@/:id/games': slidingPage(userGames),
      '/@/:id/games/:filter': userGames,
      '/@/:id/:variant/perf': slidingPage(userVariantPerf),
      '/@/:id/tv': userTV,
      '/editor': editor,
      '/editor/:fen': editor,
      '/players': players,
      '/ranking': ranking,
      '/settings': slidingPage(settingsUi),
      '/settings/preferences': slidingPage(settingsPreferences),
      '/settings/gameDisplay': slidingPage(settingsGameDisplay),
      '/settings/gameBehavior': slidingPage(settingsGameBehavior),
      '/settings/privacy': slidingPage(settingsPrivacy),
      '/settings/themes/board': slidingPage(boardThemes),
      '/settings/themes/piece': slidingPage(pieceThemes),
      '/settings/lang': slidingPage(settingsLang),
      '/training': training,
      '/training/:id': training,
      '/tournament': tournamentList,
      '/tournament/:id': tournament
    });
  }
};
