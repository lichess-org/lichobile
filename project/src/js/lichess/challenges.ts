import i18n from '../i18n';
import sound from '../sound';
import settings from '../settings';
import { throttle } from 'lodash';
import { getChallenges } from '../xhr';

type ChallengeStatus = 'created' | 'offline' | 'canceled' | 'declined' | 'accepted';

interface ChallengeUser {
  id: string;
  rating: number;
  provisional?: boolean
}

interface TimeControl {
  type: 'clock' | 'correspondence' | 'unlimited';
  show?: string;
  daysPerTurn?: number;
  limit: number;
  increment: number;
}

export interface Challenge {
  id: string
  direction: 'in' | 'out'
  status: ChallengeStatus
  challenger?: ChallengeUser
  destUser?: ChallengeUser
  variant: Variant
  initialFen: string
  rated: boolean
  timeControl: TimeControl
  color: Color
  perf: {
    icon: string
    name: string
  }
}

interface ChallengesData {
  in: Array<Challenge>
  out: Array<Challenge>
}

let incoming: Array<Challenge> = [];
let sending: Array<Challenge> = [];

function supportedAndCreated(c: Challenge) {
  return settings.game.supportedVariants.indexOf(c.variant.key) !== -1 &&
    c.status === 'created';
}

function set(data: ChallengesData) {
  if (data.in.length > incoming.length) {
    sound.dong();
  }
  incoming = data.in;
  sending = data.out;
}

export default {
  all() {
    return incoming.filter(supportedAndCreated).concat(sending.filter(supportedAndCreated));
  },

  incoming() {
    return incoming.filter(supportedAndCreated);
  },

  sending() {
    return sending.filter(supportedAndCreated);
  },

  set,

  refresh() {
    return throttle(getChallenges, 1000)().then(set);
  },

  remove(id: string) {
    incoming = incoming.filter((c: Challenge) => c.id !== id);
    sending = sending.filter((c: Challenge) => c.id !== id);
  },

  isPersistent(c: Challenge) {
    return c.timeControl.type === 'correspondence' ||
      c.timeControl.type === 'unlimited';
  },

  challengeTime(c: Challenge): string {
    if (c.timeControl.type === 'clock') {
      return c.timeControl.show;
    } else if (c.timeControl.type === 'correspondence') {
      return i18n('nbDays', c.timeControl.daysPerTurn);
    } else {
      return '∞';
    }
  }
};
