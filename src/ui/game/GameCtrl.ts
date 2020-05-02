import { Plugins } from '@capacitor/core'
import router from '../../router'
import storage from '../../storage'
import * as gameApi from '../../lichess/game'
import { OnlineGameData } from '../../lichess/interfaces/game'
import variantApi from '../../lichess/variant'
import sound from '../../sound'
import vibrate from '../../vibrate'
import i18n from '../../i18n'
import OnlineRound from '../shared/round/OnlineRound'
import gamesMenu from '../gamesMenu'


export default class GameCtrl {
  public round?: OnlineRound

  constructor (
    readonly id: string,
    readonly data: OnlineGameData,
    readonly time: number,
    readonly goingBack: boolean,
  ) {

    if (!data.player.spectator && !gameApi.isSupportedVariant(data)) {
      Plugins.LiToast.show({ text: i18n('unsupportedVariant', data.game.variant.name), duration: 'short' })
      router.set('/')
    }
    else {
      if (gameApi.isPlayerPlaying(data) &&
      gameApi.nbMoves(data, data.player.color) === 0) {
        sound.dong()
        vibrate.quick()
        const variant = variantApi(data.game.variant.key)
        const storageKey = variantStorageKey(data.game.variant.key)
        if (variant.alert && [1, 3].indexOf(variant.id) === -1 &&
        !storage.get(storageKey)) {
          Plugins.Modals.alert({
            title: 'Alert',
            message: variant.alert
          }).then(() => {
            storage.set(storageKey, true)
          })
        }
      }

      const elapsed = performance.now() - time

      setTimeout(() => {
        this.round = new OnlineRound(!!goingBack, id, data)
      }, Math.max(400 - elapsed, 0))

      gamesMenu.resetLastJoined()

      if (data.player.user === undefined) {
        storage.set('lastPlayedGameURLAsAnon', data.url.round)
      }
    }
  }

  public unload() {
    if (this.round) {
      this.round.unload()
    }
  }
}

function variantStorageKey(variant: string) {
  return 'game.variant.prompt.' + variant
}
