import throttle from 'lodash-es/throttle'
import { Plugins } from '@capacitor/core'
import i18n from '../../../i18n'
import socket, { SocketIFace, RedirectObj, LichessMessageAny, MessageHandlers } from '../../../socket'
import * as gameApi from '../../../lichess/game'
import { GameCrowd, ApiEnd } from '../../../lichess/interfaces/game'
import { ChatMsg } from '../../../lichess/interfaces/chat'
import { Move, Drop } from '../../../lichess/interfaces/move'
import redraw from '../../../utils/redraw'
import sound from '../../../sound'
import vibrate from '../../../vibrate'
import OnlineRound from './OnlineRound'
import backoff from './backoff'

export default class RoundSocket {

  public iface: SocketIFace

  constructor (
    readonly ctrl: OnlineRound,
    onFeatured?: () => void,
  ) {

    function reload(o: LichessMessageAny) {
      // avoid reload if possible!
      if (o && o.t && handlers[o.t])
        handlers[o.t](o.d)
      else
        ctrl.reloadGameData()
    }

    const handlers: MessageHandlers = {
       takebackOffers(o: { [index: string]: boolean }) {
         if (!ctrl.data.player.proposingTakeback && o[ctrl.data.player.color]) {
           sound.dong()
           vibrate.quick()
         }
         if (!ctrl.data.opponent.proposingTakeback && o[ctrl.data.opponent.color]) {
           sound.dong()
           vibrate.quick()
         }
         ctrl.data.player.proposingTakeback = o[ctrl.data.player.color]
         ctrl.data.opponent.proposingTakeback = o[ctrl.data.opponent.color]
         redraw()
       },
       move(o: Move) {
         o.isMove = true
         ctrl.apiMove(o)
         redraw()
       },
       drop(o: Drop) {
         o.isDrop = true
         ctrl.apiMove(o)
         redraw()
       },
       clockInc(o: { color: Color, time: number }) {
         if (ctrl.clock) {
           ctrl.clock.addTime(o.color, o.time)
           redraw()
         }
       },
       cclock(o: { white: number, black: number }) {
         if (ctrl.data.correspondence && ctrl.correspondenceClock) {
           ctrl.data.correspondence.white = o.white
           ctrl.data.correspondence.black = o.black
           ctrl.correspondenceClock.update(o.white, o.black)
           redraw()
         }
       },
       checkCount(e: { white: number, black: number }) {
         const isWhite = ctrl.data.player.color === 'white'
         ctrl.data.player.checks = isWhite ? e.white : e.black
         ctrl.data.opponent.checks = isWhite ? e.black : e.white
         redraw()
       },
       berserk(color: Color) {
         ctrl.setBerserk(color)
       },
       redirect(e: string | RedirectObj) {
         socket.redirectToGame(e)
       },
       reload,
       endData(o: ApiEnd) {
         ctrl.endWithData(o)
         redraw()
       },
       rematchOffer(by: Color) {
         ctrl.data.player.offeringRematch = by === ctrl.data.player.color
         const fromOp = ctrl.data.opponent.offeringRematch = by === ctrl.data.opponent.color
         if (fromOp) {
           Plugins.LiToast.show({ text: i18n('yourOpponentWantsToPlayANewGameWithYou'), duration: 'short' })
         }
         redraw()
       },
       rematchTaken(nextId: string) {
         ctrl.data.game.rematch = nextId
         // redraw()
       },
       drawOffer(by: Color) {
         ctrl.data.player.offeringDraw = by === ctrl.data.player.color
         const fromOp = ctrl.data.opponent.offeringDraw = by === ctrl.data.opponent.color
         if (fromOp) {
           Plugins.LiToast.show({ text: i18n('yourOpponentOffersADraw'), duration: 'short' })
         }
         redraw()
       },
       gone(isGone: boolean) {
         if (!ctrl.data.opponent.ai && ctrl.data.game.speed !== 'correspondence') {
           gameApi.setIsGone(ctrl.data, ctrl.data.opponent.color, isGone)
           if (!ctrl.chat || !ctrl.chat.showing) redraw()
         }
       },
       message(msg: ChatMsg) {
         if (ctrl.chat) ctrl.chat.append(msg)
       },
       tvSelect(o: { channel: string }) {
         if (ctrl.data.tv && o.channel === ctrl.data.tv && onFeatured) onFeatured()
       },
       crowd(o: GameCrowd) {
         gameApi.setOnGame(ctrl.data, <Color>'white', o.white)
         gameApi.setOnGame(ctrl.data, <Color>'black', o.black)
         ctrl.data.watchers = o.watchers
         if (!ctrl.chat || !ctrl.chat.showing) redraw()
       }
     }

     this.iface = socket.createGame(
       ctrl.data.url.socket,
       ctrl.data.player.version,
       handlers,
       ctrl.data.url.round,
       ctrl.data.userTV
     )
  }

  public moreTime = throttle(() => {
    this.iface.send('moretime')
  }, 300)

  public outoftime = backoff(500, 1.1, () => {
    this.iface.send('flag', this.ctrl.data.game.player)
  })

  public berserk = throttle(() => {
    this.iface.send('berserk', null, { ackable: true })
  }, 200)
}
