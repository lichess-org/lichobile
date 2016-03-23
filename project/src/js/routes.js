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
const fadesPage = helper.fadesPage;

export default {
  init() {
    m.route(document.body, '/', {
      '/': fadesPage(home),
      '/otb': fadesPage(otb),
      '/ai': fadesPage(ai),
      '/game/:id': fadesPage(game),
      '/game/:id/:color': slidingPage(game),
      '/analyse': fadesPage(analyse),
      '/analyse/fen/:fen': fadesPage(analyse),
      '/analyse/:source/:id': slidingPage(analyse),
      '/analyse/:source/:id/:color': slidingPage(analyse),
      '/challenge/:id': fadesPage(challenge),
      '/tv': fadesPage(tv),
      '/correspondence': fadesPage(correspondence),
      '/@/:id': slidingPage(user),
      '/@/:id/following': fadesPage(userFollowing),
      '/@/:id/followers': fadesPage(userFollowers),
      '/@/:id/games': slidingPage(userGames),
      '/@/:id/games/:filter': fadesPage(userGames),
      '/@/:id/:variant/perf': slidingPage(userVariantPerf),
      '/@/:id/tv': fadesPage(userTV),
      '/editor': fadesPage(editor),
      '/editor/:fen': fadesPage(editor),
      '/players': fadesPage(players),
      '/ranking': fadesPage(ranking),
      '/settings': slidingPage(settingsUi),
      '/settings/preferences': slidingPage(settingsPreferences),
      '/settings/gameDisplay': slidingPage(settingsGameDisplay),
      '/settings/gameBehavior': slidingPage(settingsGameBehavior),
      '/settings/privacy': slidingPage(settingsPrivacy),
      '/settings/themes/board': slidingPage(boardThemes),
      '/settings/themes/piece': slidingPage(pieceThemes),
      '/settings/lang': slidingPage(settingsLang),
      '/training': fadesPage(training),
      '/training/:id': fadesPage(training),
      '/tournament': fadesPage(tournamentList),
      '/tournament/:id': fadesPage(tournament)
    });
  }
};
