import { plural } from '../i18n'
import sound from '../sound'
import settings from '../settings'
import throttle from 'lodash-es/throttle'
import { getChallenges } from '../xhr'
import { Challenge, ChallengesData, isTimeControlClock, isTimeControlCorrespondence } from '../lichess/interfaces/challenge'

let incoming: ReadonlyArray<Challenge> = []
let sending: ReadonlyArray<Challenge> = []

function supportedAndCreated(c: Challenge) {
  return settings.game.supportedVariants.indexOf(c.variant.key) !== -1 &&
    c.status === 'created'
}

function set(data: ChallengesData) {
  if (data.in.length > incoming.length) {
    sound.dong()
  }
  incoming = data.in
  sending = data.out
}

export default {
  all() {
    return incoming.filter(supportedAndCreated).concat(sending.filter(supportedAndCreated))
  },

  incoming() {
    return incoming.filter(supportedAndCreated)
  },

  sending() {
    return sending.filter(supportedAndCreated)
  },

  set,

  refresh() {
    return throttle(getChallenges, 1000)().then(set)
  },

  remove(id: string) {
    incoming = incoming.filter((c: Challenge) => c.id !== id)
    sending = sending.filter((c: Challenge) => c.id !== id)
  },

  isPersistent(c: Challenge) {
    return c.timeControl.type === 'correspondence' ||
      c.timeControl.type === 'unlimited'
  },

  challengeTime(c: Challenge): string {
    if (isTimeControlClock(c.timeControl)) {
      return c.timeControl.show
    } else if (isTimeControlCorrespondence(c.timeControl)) {
      return plural('nbDays', c.timeControl.daysPerTurn)
    } else {
      return '∞'
    }
  }
}
