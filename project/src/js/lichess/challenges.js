import remove from 'lodash/array/remove';
var currentChallenges = [];

export default {
  list() {
    return currentChallenges;
  },

  count() {
    return currentChallenges.length;
  },

  set(list) {
    currentChallenges = list;
  },

  add(obj) {
    currentChallenges.unshift(obj);
  },

  remove(id) {
    remove(currentChallenges, (o) => o.id === id);
  }
};
