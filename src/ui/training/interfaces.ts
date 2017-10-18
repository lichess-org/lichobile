import { PuzzleData, Puzzle } from '../../lichess/interfaces/training'

export interface Data extends PuzzleData {
  game: {
    variant: {
      key: VariantKey
    }
  }
  player: {
    color: Color
  }
  progress: any
  playHistory: any
  chess: any
  puzzle: PimpedPuzzle
  comment?: 'great' | 'retry' | 'fail'
  replay?: any
}


export interface PimpedPuzzle extends Puzzle {
  opponentColor: Color
}
