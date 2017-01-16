export interface Friend {
  name: string;
  playing: boolean;
  patron: boolean;
}

let onlineFriends: Array<Friend> = [];

function makeFriend(name: string, isPlaying: boolean, isPatron: boolean) {
  return {'name' : name, 'playing': isPlaying, 'patron': isPatron};
}

/** Compares usernames for equality, ignoring prefixed titles (such as GM) */
function isSameUser(userId: string, name: string) {
  const id = (name.indexOf(' ') >= 0) ? name.split(' ')[1] : name;
  return id.toLowerCase() === userId;
}

function setPlaying(userName: string, playing: boolean) {
  const user = onlineFriends.find(u =>
    isSameUser(userName.toLowerCase(), u.name)
  );
  if (user) user.playing = playing;
}

function setPatron(userName: string, patron: boolean) {
  const user = onlineFriends.find(u =>
    isSameUser(userName.toLowerCase(), u.name)
  );
  if (user) user.patron = patron;
}

function lexicallyCompareFriends(friend1: Friend, friend2: Friend) {
  if (friend1.name.toLowerCase() < friend2.name.toLowerCase())
    return -1;
  else if (friend1.name.toLowerCase() > friend2.name.toLowerCase())
    return 1;
  else
    return 0;
}

function list(): Array<Friend> {
  return onlineFriends;
}

function count() {
  return onlineFriends.length;
}

function set(friends: Array<string>, playings: Array<string>, patrons: Array<string> ) {
  onlineFriends = friends.map(name => makeFriend(name, false, false));

  playings.forEach(user => setPlaying(user, true))
  patrons.forEach(user => setPatron(user, true))
  onlineFriends.sort(lexicallyCompareFriends);
}

function add(name: string, playing: boolean, patron: boolean) {
  const friend = makeFriend(name, playing, patron);

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
