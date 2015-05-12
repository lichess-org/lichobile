const challenges = {};

function countdown(key) {
  return setTimeout(() => {
    delete challenges[key];
    m.redraw();
  }, 3000);
}

export default {
  list() {
    return Object.keys(challenges).map(k => challenges[k].val);
  },

  count() {
    return Object.keys(challenges).length;
  },

  get(key) {
    return challenges[key] && challenges[key].val;
  },

  hasKey(key) {
    return challenges.hasOwnProperty(key);
  },

  add(key, val) {
    challenges[key] = { timeoutID: countdown(key), val };
  },

  remind(key) {
    let c = challenges[key];
    if (c) {
      clearTimeout(c.timeoutID);
      c.timeoutID = countdown(key);
    }
  },

  remove(key) {
    delete challenges[key];
  }
};
