import settings from '../settings';

var incoming = [];
var sending = [];

function supportedAndCreated(c) {
  return settings.game.supportedVariants.indexOf(c.variant.key) !== -1 &&
    c.status === 'created';
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

  set(data) {
    incoming = data.in;
    sending = data.out;
  },

  remove(id) {
    incoming = incoming.filter(c => c.id !== id);
    sending = sending.filter(c => c.id !== id);
  }
};
