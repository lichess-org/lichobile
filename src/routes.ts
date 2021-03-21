import { withRouter, onRouteMatch, processQuerystring } from './router'

export default {
  init() {
    withRouter(router => {

      router.add('',  ({ params }) => {
        import('./ui/home/home').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('timeline', ({ params }) => {
        import('./ui/timeline').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('otb', ({ params }) => {
        import('./ui/otb/otb').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('otb/variant/:variant/fen/:fen', ({ params }) => {
        import('./ui/otb/otb').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('ai', ({ params }) => {
        import('./ui/ai/ai').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('ai/variant/:variant/fen/:fen/color/:color', ({ params }) => {
        import('./ui/ai/ai').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('game/:id', ({ params }) => {
        import('./ui/game/game').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('tournament/:tournamentId/game/:id', ({ params }) => {
        import('./ui/game/game').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('analyse/:source/:id/:color', ({ params }) => {
        import('./ui/analyse/analyse').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('analyse/:source/:id', ({ params }) => {
        import('./ui/analyse/analyse').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('analyse/fen/:fen', ({ params }) => {
        import('./ui/analyse/analyse').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('analyse/variant/:variant', ({ params }) => {
        import('./ui/analyse/analyse').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('analyse/variant/:variant/fen/:fen', ({ params }) => {
        import('./ui/analyse/analyse').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('analyse', ({ params }) => {
        import('./ui/analyse/analyse').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('importer', ({ params }) => {
        import('./ui/importer/importer').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('tv', ({ params }) => {
        import('./ui/tv').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('tv/:channel', ({ params }) => {
        import('./ui/tv').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('@/:id', ({ params }) => {
        import('./ui/user/user').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('@/:id/related', ({ params }) => {
        import('./ui/user/related/related').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('@/:id/games', ({ params }) => {
        import('./ui/user/games/games').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('@/:id/games/:filter', ({ params }) => {
        import('./ui/user/games/games').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('@/:id/:perf/perf', ({ params }) => {
        import('./ui/user/perfStats/perfStats').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('@/:id/tv', ({ params }) => {
        import('./ui/user/userTv').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('about', ({ params }) => {
        import('./ui/about').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('account/preferences', ({ params }) => {
        import('./ui/user/account/preferences').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('account/preferences/game-display', ({ params }) => {
        import('./ui/user/account/gameDisplay').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('account/preferences/game-behavior', ({ params }) => {
        import('./ui/user/account/gameBehavior').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('account/preferences/clock', ({ params }) => {
        import('./ui/user/account/clock').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('account/preferences/privacy', ({ params }) => {
        import('./ui/user/account/privacy').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('account/preferences/kidMode', ({ params }) => {
        import('./ui/user/account/kid').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('clock', ({ params }) => {
        import('./ui/clock/clock').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('editor', ({ params }) => {
        import('./ui/editor/editor').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('editor/:fen', ({ params }) => {
        import('./ui/editor/editor').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('inbox', ({ params }) => {
        import('./ui/msg/msg').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('inbox/:id', ({ params }) => {
        import('./ui/msg/msg').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('inbox/new', ({ params }) => {
        import('./ui/msg/msg').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('inbox/new/:id', ({ params }) => {
        import('./ui/msg/msg').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('players', ({ params }) => {
        import('./ui/players/players').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('search', ({ params }) => {
        import('./ui/search/search').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('settings', ({ params }) => {
        import('./ui/settings/settings').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('settings/gameDisplay', ({ params }) => {
        import('./ui/settings/gameDisplay').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('settings/clock', ({ params }) => {
        import('./ui/settings/clock').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('settings/gameBehavior', ({ params }) => {
        import('./ui/settings/gameBehavior').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('settings/soundNotifications', ({ params }) => {
        import('./ui/settings/soundNotifications').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('settings/background', ({ params }) => {
        import('./ui/settings/background').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('settings/themes/board', ({ params }) => {
        import('./ui/settings/boardTheme').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('settings/themes/piece', ({ params }) => {
        import('./ui/settings/pieceThemes').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('settings/lang', ({ params }) => {
        import('./ui/settings/lang').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('teams', ({ params }) => {
        import('./ui/teams/teamsList').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('teams/:id', ({ params }) => {
        import('./ui/teams/detail/teamDetail').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('training', ({ params }) => {
        import('./ui/training/training').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('training/:id', ({ params }) => {
        import('./ui/training/training').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('tournament', ({ params }) => {
        import('./ui/tournament/tournamentList').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('tournament/:id', ({ params }) => {
        import('./ui/tournament/detail/tournamentDetail').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('study', ({ params }) => {
        import('./ui/study/studyIndex').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('study/:id', ({ params }) => {
        import('./ui/study/study').then(m => {
          onRouteMatch(m.default, params)
        })
      })

      router.add('study/:id/chapter/:chapterId', ({ params }) => {
        import('./ui/study/study').then(m => {
          onRouteMatch(m.default, params)
        })
      })

    })

    window.addEventListener('popstate', processQuerystring)
    processQuerystring()
  }
}
