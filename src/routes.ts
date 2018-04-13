import home from './ui/home'
import timeline from './ui/timeline'
import game from './ui/game'
import analyse from './ui/analyse'
import challenge from './ui/challenge'
import tv from './ui/tv'
import correspondence from './ui/correspondence'
import otb from './ui/otb'
import ai from './ui/ai'
import settingsUi from './ui/settings'
import settingsSoundNotifications from './ui/settings/soundNotifications'
import settingsLang from './ui/settings/lang'
import settingsGameDisplay from './ui/settings/gameDisplay'
import settingsGameBehavior from './ui/settings/gameBehavior'
import theme from './ui/settings/theme'
import boardThemes from './ui/settings/boardThemes'
import pieceThemes from './ui/settings/pieceThemes'
import user from './ui/user'
import userFollowing from './ui/user/following'
import userFollowers from './ui/user/followers'
import userGames from './ui/user/games'
import userPerfStats from './ui/user/perfStats'
import userTV from './ui/user/tv'
import accountPreferences from './ui/user/account/preferences'
import accountPrivacy from './ui/user/account/privacy'
import accountKidMode from './ui/user/account/kid'
import players from './ui/players'
import ranking from './ui/ranking'
import training from './ui/training'
import tournamentsList from './ui/tournament'
import tournamentDetail from './ui/tournament/detail'
import editor from './ui/editor'
import clock from './ui/clock'
import inbox from './ui/inbox'
import inboxThread from './ui/inbox/thread'
import inboxCompose from './ui/inbox/compose'
import importer from './ui/importer'
import search from './ui/search'
import study from './ui/study'
import about from './ui/about'
import { defineRoutes } from './router'

export default {
  init() {
    defineRoutes(document.body, {
      '': home,
      'timeline': timeline,
      'otb': otb,
      'otb/variant/:variant/fen/:fen': otb,
      'ai': ai,
      'ai/variant/:variant/fen/:fen/color/:color': ai,
      'game/:id': game,
      'tournament/:tournamentId/game/:id': game,
      'analyse/:source/:id/:color': analyse,
      'analyse/:source/:id': analyse,
      'analyse/fen/:fen': analyse,
      'analyse/variant/:variant': analyse,
      'analyse/variant/:variant/fen/:fen': analyse,
      'analyse': analyse,
      'importer': importer,
      'challenge/:id': challenge,
      'tv': tv,
      'tv/:channel': tv,
      'correspondence': correspondence,
      '@/:id': user,
      '@/:id/following': userFollowing,
      '@/:id/followers': userFollowers,
      '@/:id/games': userGames,
      '@/:id/games/:filter': userGames,
      '@/:id/:perf/perf': userPerfStats,
      '@/:id/tv': userTV,
      'about': about,
      'account/preferences': accountPreferences,
      'account/preferences/privacy': accountPrivacy,
      'account/preferences/kidMode': accountKidMode,
      'clock': clock,
      'editor': editor,
      'editor/:fen': editor,
      'inbox': inbox,
      'inbox/:id': inboxThread,
      'inbox/new': inboxCompose,
      'inbox/new/:userId': inboxCompose,
      'players': players,
      'ranking': ranking,
      'search': search,
      'settings': settingsUi,
      'settings/gameDisplay': settingsGameDisplay,
      'settings/gameBehavior': settingsGameBehavior,
      'settings/soundNotifications': settingsSoundNotifications,
      'settings/theme': theme,
      'settings/themes/board': boardThemes,
      'settings/themes/piece': pieceThemes,
      'settings/lang': settingsLang,
      'training': training,
      'training/:id': training,
      'tournament': tournamentsList,
      'tournament/:id': tournamentDetail,
      'study/:id': study,
      'study/:id/chapter/:chapterId': study,
    })
  }
}
