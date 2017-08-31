import socket from '../../../socket'
import * as throttle from 'lodash/throttle'
import redraw from '../../../utils/redraw'
import * as utils from '../../../utils'
import { Tournament } from '../../../lichess/interfaces/tournament'

import * as xhr from '../tournamentXhr'
import faq, { FaqCtrl } from '../faq'
import playerInfo, { PlayerInfoCtrl } from './playerInfo'
import socketHandler from './socketHandler'

export default class TournamentCtrl {
  public id: string
  public tournament: Tournament
  public hasJoined: boolean
  public isLoading: boolean
  public notFound: boolean

  public faqCtrl: FaqCtrl
  public playerInfoCtrl: PlayerInfoCtrl

  private currentPage?: number
  private clockIntervalId: number

  constructor(id: string) {
    this.id = id
    this.hasJoined = false
    this.isLoading = false
    this.notFound = false

    this.faqCtrl = faq.controller(this)
    this.playerInfoCtrl = playerInfo.controller(this)

    xhr.tournament(id)
    .then(data => {
      this.tournament = data
      this.hasJoined = !!(data.me && !data.me.withdraw)
      this.clockIntervalId = setInterval(this.tick, 1000)
      const featuredGame = data.featured ? data.featured.id : undefined
      socket.createTournament(
        this.id,
        this.tournament.socketVersion,
        socketHandler(this),
        featuredGame
      )
      redraw()
    })
    .catch(err => {
      if (utils.isFetchError(err) && err.response.status === 404) {
        this.notFound = true
        redraw()
      } else {
        utils.handleXhrError(err)
      }
    })
  }

  reload = (data: Tournament) => {
    this.isLoading = false
    const oldData = this.tournament
    if (data.featured && (!oldData || !oldData.featured || (data.featured.id !== oldData.featured.id))) {
      socket.send('startWatching', data.featured.id)
    }
    else if (data.featured && (!oldData || !oldData.featured || (data.featured.id === oldData.featured.id))) {
      data.featured = oldData.featured
    }
    this.tournament = data
    this.hasJoined = !!(data.me && !data.me.withdraw)

    if (data.socketVersion) {
      socket.setVersion(data.socketVersion)
    }
    redraw()
  }

  tick = () => {
    const data = this.tournament
    if (data.secondsToStart && data.secondsToStart > 0) {
      data.secondsToStart--
    }
    if (data.secondsToFinish && data.secondsToFinish > 0) {
      data.secondsToFinish--
    }
    redraw()
  }

  join = (tid: string, password?: string) => {
    xhr.join(tid, password)
    .then(() => {
      this.hasJoined = true
      // Reset the page so next reload goes to player position
      this.currentPage = undefined
      redraw()
    })
    .catch(utils.handleXhrError)
  }

  withdraw = (tid: string) => {
    xhr.withdraw(tid)
    .then(() => {
      this.hasJoined = false
      redraw()
    })
    .catch(utils.handleXhrError)
  }

  throttledReload = throttle((tid: string, p?: number) => {
    if (p) this.currentPage = p
    this.isLoading = true
    xhr.reload(tid, this.currentPage)
    .then(this.reload)
    .catch(err => {
      if (utils.isFetchError(err) && err.response.status === 404) {
        this.notFound = true
      }
      this.isLoading = false
    })
  }, 1000)

  first = () => {
    const p = this.tournament.standing.page
    if (!this.isLoading && p > 1) this.throttledReload(this.id, 1)
  }

  prev = () => {
    const p = this.tournament.standing.page
    if (!this.isLoading && p > 1) this.throttledReload(this.id, p - 1)
  }

  next = () => {
    const p = this.tournament.standing.page
    const nbPlayers = this.tournament.nbPlayers
    if (!this.isLoading && p < nbPlayers / 10) this.throttledReload(this.id, p + 1)
  }

  last = () => {
    const p = this.tournament.standing.page
    const nbPlayers = this.tournament.nbPlayers
    if (!this.isLoading && p < nbPlayers / 10) this.throttledReload(this.id, Math.ceil(nbPlayers / 10))
  }

  me = () => {
    const me = this.tournament.me
    if (!this.isLoading && me) this.throttledReload(this.id, Math.ceil(me.rank / 10))
  }

  onUnload() {
    clearInterval(this.clockIntervalId)
  }
}
