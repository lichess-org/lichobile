import router from './router'
import i18n from './i18n'
import session, { Session } from './session'
import signupModal from './ui/signupModal'
import { handleXhrError } from './utils'
import { cleanFenUri } from './utils/fen'
import { getChallenge } from './xhr'

export default {
  init() {
    const universalLinks = window.universalLinks

    universalLinks.subscribe('analysis', () => router.set('/analyse'))
    universalLinks.subscribe('analysisPosition', handleAnalysisPosition)
    universalLinks.subscribe('challenge', (eventData: UniversalLinks.EventData) => router.set('/challenge/' + eventData.path.split('/').pop()))
    universalLinks.subscribe('editor', () => router.set('/editor'))
    universalLinks.subscribe('inbox', () => router.set('/inbox'))
    universalLinks.subscribe('inboxNew', () => router.set('/inbox/new'))
    universalLinks.subscribe('players', () => router.set('/players'))
    universalLinks.subscribe('tournamentDetail', (eventData: UniversalLinks.EventData) => router.set('/tournament/' + eventData.path.split('/').pop()))
    universalLinks.subscribe('tournamentList', () => router.set('/tournament'))
    universalLinks.subscribe('training', () => router.set('/training'))
    universalLinks.subscribe('trainingProblem', handleTrainingProblem)
    universalLinks.subscribe('tv', () => router.set('/tv'))
    universalLinks.subscribe('tvChannel', (eventData: UniversalLinks.EventData) => router.set('/tv/' + eventData.path.split('/').pop()))
    universalLinks.subscribe('userVariantProfile', handleVariantProfile)
    universalLinks.subscribe('userProfile', (eventData: UniversalLinks.EventData) => router.set('/@/' + eventData.path.split('/').pop()))
    universalLinks.subscribe('signupConfirm', (data: UniversalLinks.EventData) => {
      const token = data.path.split('/').pop()
      if (token) {
        session.confirmEmail(token)
        .then((data: Session) => {
          signupModal.close()
          router.set(`/@/${data.id}`)
          setTimeout(() => {
            window.plugins.toast.show(i18n('loginSuccessful'), 'long', 'center')
          }, 1000)
        })
        .catch(handleXhrError)
      }
    })
    universalLinks.subscribe('other', handleOther)
  }
}

function handleVariantProfile (eventData: UniversalLinks.EventData) {
  const pieces = eventData.path.split('/')
  const uid = pieces[2]
  const variant = pieces[4]
  router.set('/@/' + uid + '/' + variant + '/perf')
}

// handle link like:
// https://www.en.lichess.org/analysis/2b1rrk1/p4Np1/6Pp/q2p3Q/n1pP4/b1P1B3/P1BK1P2/1R4R1_w_-_-_0_1
function handleAnalysisPosition (eventData: UniversalLinks.EventData) {
  let pathSuffix = eventData.path.replace('/analysis', '')
  pathSuffix = cleanFenUri(pathSuffix)
  router.set(`/analyse/fen/${encodeURIComponent(pathSuffix)}`)
}

function handleTrainingProblem (eventData: UniversalLinks.EventData) {
  const pieces = eventData.path.split('/')
  const problem = pieces[2]
  if (problem === 'coordinate') {
    window.open(eventData.url, '_blank', 'location=no')
  }
  else {
    router.set('/training/' + problem)
  }
}

function handleOther (eventData: UniversalLinks.EventData) {
  const pieces = eventData.path.split('/')
  if (eventData.path.search('^\/([a-zA-Z0-9]{8})$') !== -1) {
    getChallenge(pieces[1])
    .then(() =>
      router.set('/challenge/' + pieces[1])
    )
    .catch(() => router.set('/game/' + pieces[1]))
  }
  else if (eventData.path.search('^\/([a-zA-Z0-9]{8})+\/+(white|black)$') !== -1) {
    router.set('/game/' + pieces[1] + '/' + pieces[2])
  }
  else if (eventData.path.search('^\/([a-zA-Z0-9]{12})$') !== -1) {
    router.set('/game/' + pieces[1])
  }
  else {
    window.open(eventData.url, '_blank', 'location=no')
  }
}
