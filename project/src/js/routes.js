import helper from './ui/helper';
import home from './ui/home';
import timeline from './ui/timeline';
import game from './ui/game';
import analyse from './ui/analyse';
import challenge from './ui/challenge';
import tv from './ui/tv';
import correspondence from './ui/correspondence';
import otb from './ui/otb';
import ai from './ui/ai';
import settingsUi from './ui/settings';
import settingsSoundNotifications from './ui/settings/soundNotifications';
import settingsLang from './ui/settings/lang';
import settingsKidMode from './ui/settings/kid';
import settingsPreferences from './ui/settings/preferences';
import settingsGameDisplay from './ui/settings/gameDisplay';
import settingsGameBehavior from './ui/settings/gameBehavior';
import settingsPrivacy from './ui/settings/privacy';
import boardThemes from './ui/settings/boardThemes';
import pieceThemes from './ui/settings/pieceThemes';
import user from './ui/user';
import userFollowing from './ui/user/following';
import userFollowers from './ui/user/followers';
import userGames from './ui/user/games';
import userVariantPerf from './ui/user/variantperf';
import userTV from './ui/user/tv';
import players from './ui/players';
import ranking from './ui/players/ranking';
import training from './ui/training';
import tournamentDetail from './ui/tournament/detail';
import tournament from './ui/tournament';
import editor from './ui/editor';
import clock from './ui/clock';
import m from 'mithril';

const slidingPage = helper.slidingPage;
const fadingPage = helper.fadingPage;

export default {
  init() {
    m.route(document.body, '/', {
      '/': fadingPage(home),
      '/timeline': slidingPage(timeline),
      '/otb': otb,
      '/ai': ai,
      '/game/:id': game,
      '/game/:id/:color': slidingPage(game),
      '/analyse': analyse,
      '/analyse/fen/:fen': analyse,
      '/analyse/:source/:id': slidingPage(analyse),
      '/analyse/:source/:id/:color': slidingPage(analyse),
      '/challenge/:id': fadingPage(challenge),
      '/tv': fadingPage(tv),
      '/correspondence': fadingPage(correspondence),
      '/@/:id': slidingPage(user),
      '/@/:id/following': fadingPage(userFollowing),
      '/@/:id/followers': fadingPage(userFollowers),
      '/@/:id/games': slidingPage(userGames),
      '/@/:id/games/:filter': slidingPage(userGames),
      '/@/:id/:variant/perf': slidingPage(userVariantPerf),
      '/@/:id/tv': fadingPage(userTV),
      '/clock': fadingPage(clock),
      '/editor': fadingPage(editor),
      '/editor/:fen': fadingPage(editor),
      '/players': fadingPage(players),
      '/ranking': fadingPage(ranking),
      '/settings': slidingPage(settingsUi),
      '/settings/preferences': slidingPage(settingsPreferences),
      '/settings/gameDisplay': slidingPage(settingsGameDisplay),
      '/settings/gameBehavior': slidingPage(settingsGameBehavior),
      '/settings/soundNotifications': slidingPage(settingsSoundNotifications),
      '/settings/privacy': slidingPage(settingsPrivacy),
      '/settings/themes/board': slidingPage(boardThemes),
      '/settings/themes/piece': slidingPage(pieceThemes),
      '/settings/lang': slidingPage(settingsLang),
      '/settings/kidMode': slidingPage(settingsKidMode),
      '/training': fadingPage(training),
      '/training/:id': fadingPage(training),
      '/tournament': fadingPage(tournament),
      '/tournament/:id': fadingPage(tournamentDetail),
      '/tournament/:tournamentId/game/:id': fadingPage(game)
    });
  }
};
