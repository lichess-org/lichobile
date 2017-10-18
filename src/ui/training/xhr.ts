import { fetchJSON } from '../../http'
import { PuzzleData } from '../../lichess/interfaces/training'

export function attempt(id: number, win: boolean): Promise<any> {
  return fetchJSON(`/training/${id}/attempt`, {
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
  return fetchJSON(`/training/${id}/load`)
}

export function newPuzzle(): Promise<any> {
  return fetchJSON('/training/new')
}
