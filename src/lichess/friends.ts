export interface Friend {
  name: string,
  title?: string
  playing: boolean
  patron: boolean
}

const onlineFriends: Map<string, Friend> = new Map()

export default {
  list(): ReadonlyArray<Friend> {
    return [...onlineFriends.values()].sort((f, f2) => lexicallyCompareFriends(f, f2))
  },
  count(): number {
    return onlineFriends.size
  },
  reset(friends: string[], playings: string[], patrons: string[] ): void {
    onlineFriends.clear()
    friends.forEach(friend => {
      const [name, title] = parseFriend(friend)
      const id = name.toLowerCase()
      const playing = playings.includes(id)
      const patron = patrons.includes(id)
      onlineFriends.set(friend, { name, title, playing, patron })
    })
  },
  set(rawName: string, playing: boolean, patron: boolean): void {
    const [name, title] = parseFriend(rawName)
    onlineFriends.set(rawName, { name, title, playing, patron })
  },
  playing(rawName: string): void {
    const friend = onlineFriends.get(rawName)
    if (friend) {
      onlineFriends.set(rawName, { ...friend, playing: true })
    }
  },
  stoppedPlaying(rawName: string): void {
    const friend = onlineFriends.get(rawName)
    if (friend) {
      onlineFriends.set(rawName, { ...friend, playing: false })
    }
  },
  remove(leaving: string): void {
    onlineFriends.delete(leaving)
  },
  clear(): void {
    onlineFriends.clear()
  },
}

function parseFriend(friend: string): [string, string | undefined] {
  const splitted = friend.split(' ')
  const name = splitted.length > 1 ? splitted[1] : splitted[0]
  const title = splitted.length > 1 ? splitted[0] : undefined
  return [name, title]
}

function lexicallyCompareFriends(friend1: Friend, friend2: Friend) {
  if (friend1.name.toLowerCase() < friend2.name.toLowerCase())
    return -1
  else if (friend1.name.toLowerCase() > friend2.name.toLowerCase())
    return 1
  else
    return 0
}
