import settings from '../settings';

var receiving = [];
var sending = [];

function isSupported(c) {
  return settings.game.supportedVariants.indexOf(c.variant.key) !== -1;
}

export default {
  all() {
    return receiving.filter(isSupported).concat(sending);
  },

  receiving() {
    return receiving.filter(isSupported);
  },

  sending() {
    return sending;
  },

  set(data) {
    receiving = data.in;
    sending = data.out;
  },

  remove(id) {
    receiving = receiving.filter(c => c.id !== id);
    sending = sending.filter(c => c.id !== id);
  }
};
