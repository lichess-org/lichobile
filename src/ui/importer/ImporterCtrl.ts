import router from '../../router'
import settings from '../../settings'
import globalConfig from '../../config'
import redraw from '../../utils/redraw'
import { serializeQueryParameters, handleXhrError } from '../../utils'
import { fetchJSON } from '../../http'
import * as helper from '../helper'
import { OnlineGameData } from '../../lichess/interfaces/game'
import * as stream from 'mithril/stream'

export interface IImporterCtrl {
  importGame(pgn: string): void
  importing: Mithril.Stream<boolean>
}

export default function ImporterCtrl(): IImporterCtrl {

  const importing = stream(false)

  function submitOnline(pgn: string, analyse: boolean): Promise<OnlineGameData> {
    const data: {[i: string]: string } = { pgn }
    if (analyse) data.analyse = '1'

    return fetchJSON('/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/vnd.lichess.v' + globalConfig.apiVersion + '+json'
      },
      body: serializeQueryParameters(data)
    }, true)
  }

  window.addEventListener('native.keyboardhide', helper.onKeyboardHide)
  window.addEventListener('native.keyboardshow', helper.onKeyboardShow)

  return {
    importGame(pgn: string) {
      importing(true)
      redraw()
      submitOnline(pgn, settings.importer.analyse())
      .then(data => {
        router.set(`/analyse/online${data.url.round}`)
      })
      .catch(err => {
        importing(false)
        redraw()
        console.error(err)
        handleXhrError(err)
      })
    },
    importing
  }
}
