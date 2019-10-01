import { Plugins } from '@capacitor/core'
import { fetchJSON, fetchText } from '../../../http'
import { serializeQueryParameters } from '../../../utils'
import i18n from '../../../i18n'
import { OnlineGameData } from '../../../lichess/interfaces/game'
import { Score } from '../../../lichess/interfaces/user'

import { OnlineRoundInterface } from '.'

export function reload(ctrl: OnlineRoundInterface): Promise<OnlineGameData> {
  return fetchJSON(ctrl.data.url.round)
}

export function getPGN(gameId: string, raw = false) {
  const params = raw ? '?evals=0&clocks=0' : '?literate=1'
  return fetchText(`/game/export/${gameId}${params}`, undefined, true)
}

export function readNote(gameId: string) {
  return fetchText(`/${gameId}/note`)
}

export function syncNote(gameId: string, notes: string) {

  return fetchText(`/${gameId}/note`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/*'
    },
    body: serializeQueryParameters({ text: notes })
  }, false)
  .catch(err => {
    Plugins.Toast.show({ text: i18n('notesSynchronizationHasFailed'), duration: 'short' })
    throw err
  })
}

export function getCrosstable(uid1: string, uid2: string): Promise<Score> {
  return fetchJSON('/api/crosstable/' + uid1 + '/' + uid2, { cache: 'reload' } )
}
