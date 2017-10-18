import { fetchJSON } from '../../http'

export function attempt(id: string, win: boolean): Promise<any> {
  return fetchJSON(`/training/${id}/attempt`, {
    method: 'POST',
    body: JSON.stringify({
      win: win ? 1 : 0
    })
  })
}

export function vote(id: string, v: number): Promise<any> {
  return fetchJSON(`/training/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify({
      vote: v
    })
  })
}

export function loadPuzzle(id: string): Promise<any> {
  return fetchJSON(`/training/${id}/load`)
}

export function newPuzzle(): Promise<any> {
  return fetchJSON('/training/new')
}
