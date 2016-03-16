var timeline = [];

export default {
  entries() {
    return timeline;
  },

  set(t) {
    timeline = t.filter(o => o.type === 'game-end');
  }
};
