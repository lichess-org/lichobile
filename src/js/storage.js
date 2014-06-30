function withStorage(f) {
  // can throw an exception when storage is full
  try {
    return !!window.localStorage ? f(window.localStorage) : null;
  } catch (e) {}
}

module.exports = {
  get: function(k) {
    return withStorage(function(s) {
      return JSON.parse(s.getItem(k));
    });
  },
  remove: function(k) {
    withStorage(function(s) {
      s.removeItem(k);
    });
  },
  set: function(k, v) {
    withStorage(function(s) {
      s.removeItem(k);
      s.setItem(k, JSON.stringify(v));
    });
  }
};
