import * as throttle from 'lodash/throttle'
import { ErrorResponse } from '../../../http'
import socket from '../../../socket'
import redraw from '../../../utils/redraw'
import * as utils from '../../../utils'
import * as tournamentApi from '../../../lichess/tournament'
import { Tournament, StandingPlayer, StandingPage } from '../../../lichess/interfaces/tournament'

import * as xhr from '../tournamentXhr'
import faq, { FaqCtrl } from '../faq'
import playerInfo, { PlayerInfoCtrl } from './playerInfo'
import socketHandler from './socketHandler'

const MAX_PER_PAGE = 10

interface PagesCache {
  [n: number]: Array<StandingPlayer>
}

export default class TournamentCtrl {
  public id: string
  public tournament: Tournament
  public page: number = 1
  public currentPageResults: Array<StandingPlayer>
  public hasJoined: boolean = false
  public notFound: boolean = false
  public focusOnMe: boolean = false
  public isLoadingPage: boolean = false

  public faqCtrl: FaqCtrl
  public playerInfoCtrl: PlayerInfoCtrl

  private pagesCache: PagesCache = {}

  constructor(id: string) {
    this.id = id

    this.faqCtrl = faq.controller(this)
    this.playerInfoCtrl = playerInfo.controller(this)

    xhr.tournament(id)
    .then(data => {
      this.tournament = data
      this.page = this.tournament.standing.page
      this.loadCurrentPage(this.tournament.standing)
      this.hasJoined = !!(data.me && !data.me.withdraw)
      this.focusOnMe = tournamentApi.isIn(this.tournament)
      this.scrollToMe()
      const featuredGame = data.featured ? data.featured.id : undefined
      socket.createTournament(
        this.id,
        this.tournament.socketVersion,
        socketHandler(this),
        featuredGame
      )
      redraw()
    })
    .catch((err: ErrorResponse) => {
      if (err.status === 404) {
        this.notFound = true
        redraw()
      } else {
        utils.handleXhrError(err)
      }
    })
  }

  join = throttle((password?: string) => {
    xhr.join(this.tournament.id, password)
    .then(() => {
      this.hasJoined = true
      this.focusOnMe = true
      redraw()
    })
    .catch(utils.handleXhrError)
  }, 1000)

  withdraw = throttle(() => {
    xhr.withdraw(this.tournament.id)
    .then(() => {
      this.hasJoined = false
      this.focusOnMe = false
      redraw()
    })
    .catch(utils.handleXhrError)
  }, 1000)

  reload = throttle(() => {
    xhr.reload(this.id, this.focusOnMe ? this.page : undefined)
    .then(this.onReload)
    .catch(this.onXhrError)
  }, 2000)

  loadPage = throttle((page: number) => {
    xhr.loadPage(this.id, page)
    .then((data: StandingPage) => {
      this.isLoadingPage = false
      if (this.page === data.page) {
        this.loadCurrentPage(data)
      } else {
        this.setPageCache(data)
      }
      redraw()
    })
    .catch(err => {
      this.isLoadingPage = false
      this.onXhrError(err)
    })
  }, 1000)

  first = () => {
    if (this.page > 1) this.userSetPage(1)
  }

  prev = () => {
    if (this.page > 1) this.userSetPage(this.page - 1)
  }

  next = () => {
    const nbPlayers = this.tournament.nbPlayers
    if (this.page < nbPlayers / MAX_PER_PAGE) this.userSetPage(this.page + 1)
  }

  last = () => {
    const nbPlayers = this.tournament.nbPlayers
    if (this.page < nbPlayers / MAX_PER_PAGE) this.userSetPage(Math.ceil(nbPlayers / MAX_PER_PAGE))
  }

  toggleFocusOnMe = () => {
    if (!this.tournament.me) return
    this.focusOnMe = !this.focusOnMe
    if (this.focusOnMe) this.scrollToMe()
    redraw()
  }

  myPage = (): number | undefined => {
    return (this.tournament.me) ?
      Math.floor((this.tournament.me.rank - 1) / MAX_PER_PAGE) + 1 :
      undefined
  }

  private scrollToMe = () => {
    const myPage = this.myPage()
    if (myPage !== undefined && myPage !== this.page) this.setPage(myPage)
  }

  private userSetPage(page: number) {
    if (this.isLoadingPage) return
    this.focusOnMe = false
    this.setPage(page)
  }

  private setPage(page: number) {
    this.page = page
    const fromCache = this.pagesCache[this.page]
    if (fromCache) {
      this.currentPageResults = fromCache
    } else {
      this.isLoadingPage = true
    }
    this.loadPage(page)
    redraw()
  }

  private setPageCache(data: StandingPage) {
    this.pagesCache[data.page] = data.players
  }

  private loadCurrentPage(data: StandingPage) {
    this.setPageCache(data)
    this.currentPageResults = data.players
  }

  private onReload = (data: Tournament) => {
    const oldData = this.tournament
    if (data.featured && (!oldData || !oldData.featured || (data.featured.id !== oldData.featured.id))) {
      socket.send('startWatching', data.featured.id)
    }
    else if (data.featured && (!oldData || !oldData.featured || (data.featured.id === oldData.featured.id))) {
      data.featured = oldData.featured
    }
    this.tournament = data
    this.setPageCache(data.standing)
    if (this.pagesCache[this.page] !== undefined) {
      this.currentPageResults = this.pagesCache[this.page]
    }
    this.hasJoined = !!(data.me && !data.me.withdraw)
    if (this.focusOnMe) this.scrollToMe()

    if (data.socketVersion) {
      socket.setVersion(data.socketVersion)
    }
    redraw()
  }

  private onXhrError = (err: ErrorResponse) => {
    if (err.status === 404) {
      this.notFound = true
    }
    redraw()
  }
}
