import { PossibleDrops } from '../../../lichess/interfaces/game'

export default {
  drop(role: Role, key: Key, possibleDrops?: PossibleDrops | null) {

    if (role === 'pawn' && (key[1] === '1' || key[1] === '8')) return false

    if (possibleDrops === undefined || possibleDrops === null) return true

    const drops = Array.isArray(possibleDrops) ?
      possibleDrops : possibleDrops.match(/.{2}/g) || []

    return drops.indexOf(key) !== -1
  }
}
