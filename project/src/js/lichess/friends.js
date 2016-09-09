var onlineFriends = [];

var makeUser = function(name, isPlaying) {
    return {
      'name' : name,
      'isPlaying' : isPlaying,
    }
};

/** Compares usernames for equality, ignoring prefixed titles (such as GM) */
var isSameUser = function(userId, name) {
  var id = (name.indexOf(' ') >= 0) ? name.split(' ')[1] : name;
  return id.toLowerCase() === userId;
};

var findByUsername = function(n) {
  return onlineFriends.filter(function(u) {
    return isSameUser(n.toLowerCase(), u.name);
  })[0];
}

var setPlaying = function(userName, playing) {
  var user = findByUsername(userName);
  if (user) user.isPlaying = playing;
};

export default {

  list() {
    return onlineFriends;
  },

  count() {
    return onlineFriends.length;
  },

  set(friends, playings) {
      onlineFriends = friends.map(name => makeUser(name, false));

      for (var user of playings) setPlaying(user, true);
  },

  add(name, playing) {
    var friend = makeUser(name, playing);

    onlineFriends.push(friend);
    onlineFriends.sort((friend1, friend2) =>
      friend1.name.toLowerCase() < friend2.name.toLowerCase() ? -1 : 1
    );
  },

  playing(name) {
    setPlaying(name, true);
  },

  stopped_playing(name) {
    setPlaying(name, false);
  },

  remove(leaving) {
    onlineFriends.filter(friend => friend.name != leaving);
  },

  clear() {
    onlineFriends = [];
  }
};
