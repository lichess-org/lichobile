import settings from '../settings';
import throttle from 'lodash/throttle';
import { getChallenges } from '../xhr';

var incoming = [];
var sending = [];

function supportedAndCreated(c) {
  return settings.game.supportedVariants.indexOf(c.variant.key) !== -1 &&
    c.status === 'created';
}

function set(data) {
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

  remove(id) {
    incoming = incoming.filter(c => c.id !== id);
    sending = sending.filter(c => c.id !== id);
  },

  isPersistent(c) {
    return c.timeControl.type === 'correspondence' ||
      c.timeControl.type === 'unlimited';
  }

};
