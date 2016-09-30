interface Friend {
  name: string;
  playing: boolean;
}

let onlineFriends: Array <Friend> = [];

function makeFriend(name: string, isPlaying: boolean) {
  return {'name' : name, 'playing': isPlaying};
}

/** Compares usernames for equality, ignoring prefixed titles (such as GM) */
function isSameUser(userId: string, name: string) {
  const id = (name.indexOf(' ') >= 0) ? name.split(' ')[1] : name;
  return id.toLowerCase() === userId;
}

function findByUsername(n: string) {
  return onlineFriends.find(u => isSameUser(n.toLowerCase(), u.name));
}

function setPlaying(userName: string, playing: boolean) {
  const user = findByUsername(userName);
  if (user) user.playing = playing;
}

function lexicallyCompareFriends(friend1: Friend, friend2: Friend) {
  if (friend1.name.toLowerCase() < friend2.name.toLowerCase())
    return -1;
  else if (friend1.name.toLowerCase() > friend2.name.toLowerCase())
    return 1;
  else
    return 0;
}

function list(): Array <Friend> {
  return onlineFriends;
}

function count() {
  return onlineFriends.length;
}

function set(friends: Array <string> , playings: Array <string> ) {
  onlineFriends = friends.map(name => makeFriend(name, false));

  for (let user of playings) setPlaying(user, true);
  onlineFriends.sort(lexicallyCompareFriends);
}

function add(name: string, playing: boolean) {
  const friend = makeFriend(name, playing);

  onlineFriends.push(friend);
  onlineFriends.sort(lexicallyCompareFriends);
}

function playing(name: string) {
  setPlaying(name, true);
}

function stoppedPlaying(name: string) {
  setPlaying(name, false);
}

function remove(leaving: string) {
  onlineFriends = onlineFriends.filter(friend => friend.name !== leaving);
}

function clear() {
  onlineFriends = [];
}

export default {
  list,
  count,
  set,
  add,
  playing,
  stoppedPlaying,
  remove,
  clear
}
