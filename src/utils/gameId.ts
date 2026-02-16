const blackSuffixPattern = /[5-9a-z]/
const gamePattern = /^\/(\w{8})(\/black|\/white)?$/
const fullGamePattern = /^\/(\w{8})(\w{3}[0-9a-zA-Z])$/
const plyHashPattern = /^#(\d+)$/

export type GameReference = {
  color: string | undefined,
  gameId: string,
  ply: string | undefined,
}

export function extractGameReference(urlObject: URL): GameReference | null {
  const path = urlObject.pathname
  const gameFound = gamePattern.exec(path)
  const ply = plyHashPattern.exec(urlObject.hash)?.[1]

  if (gameFound) {
    return {
      gameId: gameFound[1],
      color: gameFound[2]?.substring(1),
      ply: ply,
    }
  }

  const fullGameFound = fullGamePattern.exec(path)
  if (fullGameFound) {
    const gameId = fullGameFound[1]
    const color = blackSuffixPattern.test(fullGameFound[2].charAt(3)) ? 'black' : 'white'
    return {
      gameId: gameId,
      color: color,
      ply: ply,
    }
  }

  return null
}