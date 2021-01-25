// https://github.com/ornicar/scalachess/blob/master/src/main/scala/Status.scala

import i18n from '../i18n'
import { GameData } from './interfaces/game'
import { AnalyseData } from './interfaces/analyse'
import { VariantKey } from './interfaces/variant'

const ids = {
  created: 10,
  started: 20,
  aborted: 25,
  mate: 30,
  resign: 31,
  stalemate: 32,
  timeout: 33,
  draw: 34,
  outoftime: 35,
  cheat: 36,
  noStart: 37,
  unknownFinish: 38,
  variantEnd: 60
}

function started(data: GameData | AnalyseData): boolean {
  return data.game.status.id >= ids.started
}

function finished(data: GameData | AnalyseData): boolean {
  return data.game.status.id >= ids.mate
}

function aborted(data: GameData | AnalyseData): boolean {
  return data.game.status.id === ids.aborted
}

function toLabel(status: string, turns: number, winner: Color | undefined, variant: VariantKey) {
  switch (status) {
    case 'started':
      return i18n('playingRightNow')
    case 'aborted':
      return i18n('gameAborted')
    case 'mate':
      return i18n('checkmate')
    case 'resign':
      return i18n(winner === 'white' ? 'blackResigned' : 'whiteResigned')
    case 'stalemate':
      return i18n('stalemate')
    case 'timeout':
      switch (winner) {
        case 'white':
          return i18n('blackLeftTheGame')
        case 'black':
          return i18n('whiteLeftTheGame')
        default:
          return i18n('draw')
      }
    case 'draw':
      return i18n('draw')
    case 'outoftime':
      return `${turns % 2 === 0 ? i18n('whiteTimeOut') : i18n('blackTimeOut')}${winner ? '' : ` • ${i18n('draw')}`}`
    case 'noStart':
      return (winner === 'white' ? 'Black' : 'White') + ' didn\'t move'
    case 'unknownFinish':
      return i18n('finished')
    case 'cheat':
      return 'Cheat detected'
    case 'variantEnd':
      switch (variant) {
        case 'kingOfTheHill':
          return 'King in the center'
        case 'threeCheck':
          return 'Three checks'
        default:
          return 'Variant ending'
      }
    default:
      return status
  }
}

export default {
  ids,
  started,
  finished,
  aborted,
  toLabel
}
