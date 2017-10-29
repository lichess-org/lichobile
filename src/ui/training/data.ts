import { PuzzleData } from '../../lichess/interfaces/training'
import { Data, PimpedGame } from './interfaces'


export default function makeData(cfg: PuzzleData): Data {
  const variant = {
    key: 'standard' as VariantKey
  }
  const pimpedGame: PimpedGame = Object.assign(cfg.game, { variant })

  cfg.game = pimpedGame

  return cfg as Data
}
