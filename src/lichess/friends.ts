export interface Friend {
  name: string
  playing: boolean
  patron: boolean
}

let onlineFriends: Array<Friend> = []

export default {
  list(): ReadonlyArray<Friend> {
    return onlineFriends
  },
  count(): number {
    return onlineFriends.length
  },
  set(friends: string[], playings: string[], patrons: string[] ): void {
    onlineFriends = friends.map(name => makeFriend(name, false, false))
    playings.forEach(user => setPlaying(user, true))
    patrons.forEach(user => setPatron(user, true))
    onlineFriends.sort(lexicallyCompareFriends)
  },
  add(name: string, playing: boolean, patron: boolean): void {
    const friend = makeFriend(name, playing, patron)

    onlineFriends.push(friend)
    onlineFriends.sort(lexicallyCompareFriends)
  },
  playing(name: string): void {
    setPlaying(name, true)
  },
  stoppedPlaying(name: string): void {
    setPlaying(name, false)
  },
  remove(leaving: string): void {
    onlineFriends = onlineFriends.filter(friend => friend.name !== leaving)
  },
  clear(): void {
    onlineFriends = []
  },
}

function makeFriend(name: string, playing: boolean, patron: boolean) {
  return { name, playing, patron }
}

/** Compares usernames for equality, ignoring prefixed titles (such as GM) */
function isSameUser(userId: string, name: string) {
  const id = (name.indexOf(' ') >= 0) ? name.split(' ')[1] : name
  return id.toLowerCase() === userId
}

function setPlaying(userName: string, playing: boolean) {
  const user = onlineFriends.find(u =>
    isSameUser(userName.toLowerCase(), u.name)
  )
  if (user) user.playing = playing
}

function setPatron(userName: string, patron: boolean) {
  const user = onlineFriends.find(u =>
    isSameUser(userName.toLowerCase(), u.name)
  )
  if (user) user.patron = patron
}

function lexicallyCompareFriends(friend1: Friend, friend2: Friend) {
  if (friend1.name.toLowerCase() < friend2.name.toLowerCase())
    return -1
  else if (friend1.name.toLowerCase() > friend2.name.toLowerCase())
    return 1
  else
    return 0
}
