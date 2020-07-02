interface FriendStatus {
  playing: boolean
  patron: boolean
}

export type Friend = [string, FriendStatus]

const onlineFriends: Map<string, FriendStatus> = new Map()

export default {
  list(): ReadonlyArray<Friend> {
    return [...onlineFriends.entries()].sort(([f], [f2]) => lexicallyCompareFriends(f, f2))
  },
  count(): number {
    return onlineFriends.size
  },
  set(friends: string[], playings: string[], patrons: string[] ): void {
    onlineFriends.clear()
    friends.forEach(name => {
      const id = idFromName(name)
      const playing = playings.includes(id)
      const patron = patrons.includes(id)
      onlineFriends.set(name, { playing, patron })
    })
  },
  add(name: string, playing: boolean, patron: boolean): void {
    onlineFriends.set(name, { playing, patron })
  },
  playing(name: string): void {
    const friend = onlineFriends.get(name)
    if (friend) {
      onlineFriends.set(name, { playing: true, patron: friend.patron })
    }
  },
  stoppedPlaying(name: string): void {
    const friend = onlineFriends.get(name)
    if (friend) {
      onlineFriends.set(name, { playing: false, patron: friend.patron })
    }
  },
  remove(leaving: string): void {
    onlineFriends.delete(leaving)
  },
  clear(): void {
    onlineFriends.clear()
  },
}

function idFromName(name: string): string {
  const id = (name.indexOf(' ') >= 0) ? name.split(' ')[1] : name
  return id.toLowerCase()
}

function lexicallyCompareFriends(friend1: string, friend2: string) {
  if (friend1.toLowerCase() < friend2.toLowerCase())
    return -1
  else if (friend1.toLowerCase() > friend2.toLowerCase())
    return 1
  else
    return 0
}
