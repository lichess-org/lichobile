import settings from '../settings';

var challenges = {};

function isSupported(c) {
  return settings.game.supportedVariants.indexOf(c.variant.key) !== -1;
}

export default {
  receiving() {
    return challenges.in.filter(isSupported);
  },

  receivingCount() {
    return challenges.in.filter(isSupported).length;
  },

  sending() {
    return challenges.out;
  },

  hasKey(key) {
    return challenges.hasOwnProperty(key);
  },

  set(data) {
    challenges = data;
  },

  remove(key) {
    delete challenges[key];
  }
};
