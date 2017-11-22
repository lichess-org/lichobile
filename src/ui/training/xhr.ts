import router from '../../router'
import { fetchJSON } from '../../http'
import { PuzzleData, RoundData, PuzzleOutcome } from '../../lichess/interfaces/training'

export function round(outcome: PuzzleOutcome): Promise<RoundData> {
  return fetchJSON(`/training/${outcome.id}/round2`, {
    method: 'POST',
    body: JSON.stringify({
      win: outcome.win ? 1 : 0
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

export function newPuzzles(num: number): Promise<PuzzleData[]> {
  return fetchJSON<PuzzleData[]>(`/training/load/` + num)
}

export function solvePuzzles(outcomes: PuzzleOutcome[]): Promise<any> {
  return fetchJSON(`/training/solve`, {
    method: 'POST',
    body: JSON.stringify({
      solutions: outcomes.map((s: { id: number, win: boolean }) => ({ id: s.id, win: s.win ? 1 : 0 }))
    })
  })
}