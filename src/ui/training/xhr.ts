import router from '../../router'
import { fetchJSON } from '../../http'
import { PuzzleData, RoundData } from '../../lichess/interfaces/training'

export function round(id: number, win: boolean): Promise<RoundData> {
  return fetchJSON(`/training/${id}/round2`, {
    method: 'POST',
    body: JSON.stringify({
      win: win ? 1 : 0
    })
  })
}

export function vote(id: number, v: number): Promise<any> {
  return fetchJSON(`/training/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify({
      vote: v
    })
  })
}

export function loadPuzzle(id: number): Promise<PuzzleData> {
  return fetchJSON<PuzzleData>(`/training/${id}/load`)
  .then(cfg => {
    router.assignState({ puzzleId: cfg.puzzle.id }, `/training/${cfg.puzzle.id}`)
    return cfg
  })
}

export function newPuzzle(): Promise<PuzzleData> {
  return fetchJSON<PuzzleData>('/training/new')
  .then(cfg => {
    router.assignState({ puzzleId: cfg.puzzle.id }, `/training/${cfg.puzzle.id}`)
    return cfg
  })
}
