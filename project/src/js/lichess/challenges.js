const challenges = {};

function timeout(key) {
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
