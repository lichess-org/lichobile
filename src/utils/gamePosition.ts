import LRUMap from './lru'

interface Position {
  fen: string
  orientation: Color
}

// remember game positions to improve game screen loading
// gameId -> Position
export const positionsCache = new LRUMap<string, Position>(100)
