import { caseInsensitiveSort } from '../utils';

var onlineFriends = [];

export default {
  list() {
    return onlineFriends;
  },

  count() {
    return onlineFriends.length;
  },

  set(list) {
    onlineFriends = list;
  },

  add(name) {
    onlineFriends.push(name);
    onlineFriends.sort(caseInsensitiveSort);
  },

  remove(name) {
    const i = onlineFriends.indexOf(name);
    if (i !== -1) onlineFriends.splice(i, 1);
  },

  clear() {
    onlineFriends = [];
  }
};
