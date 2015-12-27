import settings from '../settings';
import m from 'mithril';

const challenges = {};

function timeout(key) {
  return setTimeout(() => {
    m.startComputation();
    delete challenges[key];
    m.endComputation();
  }, 3000);
}

function isSupported(c) {
  return settings.game.supportedVariants.indexOf(c.game.variant.key) !== -1;
}

export default {
  list() {
    return Object.keys(challenges).map(k => challenges[k].val).filter(isSupported);
  },

  count() {
    return Object.keys(challenges).map(k => challenges[k].val).filter(isSupported).length;
  },

  hasKey(key) {
    return challenges.hasOwnProperty(key);
  },

  add(key, val) {
    challenges[key] = { timeoutID: timeout(key), val };
  },

  remind(key) {
    let c = challenges[key];
    if (c) {
      clearTimeout(c.timeoutID);
      c.timeoutID = timeout(key);
    }
  },

  remove(key) {
    delete challenges[key];
  }
};
