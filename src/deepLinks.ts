import { Plugins } from '@capacitor/core'
import Rlite from 'rlite-router'
import router from './router'
import i18n from './i18n'
import session, { Session } from './session'
import signupModal from './ui/signupModal'
import { handleXhrError } from './utils'

const fenParams = ':r1/:r2/:r3/:r4/:r5/:r6/:r7/:r8'
function fenFromParams(params: any): string {
  return params.r1 + '/' + params.r2 + '/' + params.r3 + '/' + params.r4 + '/' +
    params.r5 + '/' + params.r6 + '/' + params.r7 + '/' +
    params.r8.split('_').join(' ')
}

export default {
  init() {
    Plugins.App.addListener('appUrlOpen', ({ url }) => {
      setTimeout(() => {
        const path = new URL(url).pathname
        const matched = links.run(path)
        if (!matched) {
          // it can be a game or challenge but we want to do an exact regex match
          const found = path.match(gamePattern)
          if (found) {
            const color = found[2]
            if (color) {
              router.set(`/game/${found[1]}?color=${color.substring(1)}`)
            } else {
              router.set(`/game/${found[1]}`)
            }
          } else {
            console.warn('Could not handle deep link', path)
          }
        }
      }, 100)
    })
  }
}

const links = new Rlite()
const gamePattern = /^\/(\w{8})(\/black|\/white)?$/

links.add('analysis', () => router.set('/analyse'))
links.add(`analysis/${fenParams}`, ({ params }) => {
  const fen = encodeURIComponent(fenFromParams(params))
  router.set(`/analyse/fen/${fen}`)
})
links.add('editor', () => router.set('/editor'))
links.add(`editor/${fenParams}`, ({ params }) => {
  const fen = encodeURIComponent(fenFromParams(params))
  router.set(`/editor/${fen}`)
})
links.add('inbox', () => router.set('/inbox'))
links.add('inbox/new', () => router.set('/inbox/new'))
links.add('challenge/:id', ({ params }) => router.set(`/game/${params.id}`))
links.add('study', () => router.set('/study'))
links.add('study/:id', ({ params }) => router.set(`/study/${params.id}`))
links.add('player', () => router.set('/players'))
links.add('tournament', () => router.set('/tournament'))
links.add('tournament/:id', ({ params }) => router.set(`/tournament/${params.id}`))
links.add('training', () => router.set('/training'))
links.add('training/:id', ({ params }) => router.set(`/training/${params.id}`))
links.add('tv', () => router.set('/tv'))
links.add('tv/:channel', ({ params }) => router.set(`/tv/${params.channel}`))
links.add('@/:id', ({ params }) => router.set(`/@/${params.id}`))
links.add('@/:id/tv', ({ params }) => router.set(`/@/${params.id}/tv`))
links.add('@/:id/all', ({ params }) => router.set(`/@/${params.id}/games`))
links.add('@/:id/perf/:key', ({ params }) => router.set(`/@/${params.id}/${params.key}/perf`))
links.add('signup/confirm/:token', ({ params }) => {
  const token = params.token
  if (token) {
    session.confirmEmail(token)
    .then((data: Session) => {
      signupModal.close()
      router.set(`/@/${data.id}`)
      setTimeout(() => {
        Plugins.LiToast.show({ text: i18n('loginSuccessful'), duration: 'long' })
      }, 1000)
    })
    .catch(handleXhrError)
  }
})
