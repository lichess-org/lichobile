import { Plugins, AppState, PluginListenerHandle } from '@capacitor/core'
import throttle from 'lodash-es/throttle'
import socket, { SocketIFace } from '../../../socket'
import redraw from '../../../utils/redraw'
import { fromNow } from '../../../i18n'
import * as utils from '../../../utils'
import settings from '../../../settings'
import session from '~/session'
import * as tournamentApi from '../../../lichess/tournament'
import { Tournament, StandingPlayer, StandingPage, TeamBattle, TeamColorMap } from '../../../lichess/interfaces/tournament'

import { Chat } from '~/ui/shared/chat'
import * as xhr from '../tournamentXhr'
import faq, { FaqCtrl } from '../faq'
import playerInfo, { PlayerInfoCtrl } from './playerInfo'
import teamInfo, { TeamInfoCtrl } from './teamInfo'
import socketHandler from './socketHandler'

const MAX_PER_PAGE = 10

interface PagesCache {
  [n: number]: ReadonlyArray<StandingPlayer>
}

export default class TournamentCtrl {
  public id: string
  public tournament: Tournament
  public page = 1
  public currentPageResults!: ReadonlyArray<StandingPlayer>
  public hasJoined = false
  public focusOnMe = false
  public isLoadingPage = false
  public startsAt?: string

  public readonly chat?: Chat
  public readonly socketIface: SocketIFace
  public readonly faqCtrl: FaqCtrl
  public readonly playerInfoCtrl: PlayerInfoCtrl
  public readonly teamInfoCtrl: TeamInfoCtrl

  public teamColorMap: TeamColorMap

  private pagesCache: PagesCache = {}

  private appStateListener: PluginListenerHandle

  constructor(data: Tournament) {
    this.id = data.id

    this.faqCtrl = faq.controller(this)
    this.playerInfoCtrl = playerInfo.controller(this)
    this.teamInfoCtrl = teamInfo.controller(this)

    this.tournament = data
    this.startsAt = fromNow(new Date(data.startsAt))
    this.page = this.tournament.standing.page
    this.loadCurrentPage(this.tournament.standing)
    this.hasJoined = !!(data.me && !data.me.withdraw)
    this.focusOnMe = tournamentApi.isIn(this.tournament)
    this.scrollToMe()
    const featuredGame = data.featured ? data.featured.id : undefined
    this.socketIface = socket.createTournament(
      this.id,
      this.tournament.socketVersion,
      socketHandler(this),
      featuredGame
    )

    if (data.chat) {
      this.chat = new Chat(
        this.socketIface,
        data.id,
        data.chat.lines,
        undefined,
        data.chat.writeable,
        session.isShadowban(),
        'Tournament'
      )
    }

    this.appStateListener = Plugins.App.addListener('appStateChange', (state: AppState) => {
      if (state.isActive) this.reload()
    })

    this.teamColorMap = data.teamBattle ? this.createTeamColorMap (data.teamBattle) : {}

    redraw()
  }

  join = throttle((password?: string, team?: string) => {
    xhr.join(this.tournament.id, password, team)
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
    .catch(utils.handleXhrError)
  }, 5000)

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
      utils.handleXhrError(err)
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

  unload = () => {
    this.appStateListener.remove()
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
      this.socketIface.send('startWatching', data.featured.id)
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

    this.teamColorMap = data.teamBattle ? this.createTeamColorMap (data.teamBattle) : {}

    const tb = data.teamBattle
    if (tb && !tb.joinWith.includes(settings.tournament.join.lastTeam())) {
      if (tb.joinWith.length > 0)
        settings.tournament.join.lastTeam(tb.joinWith[0])
    }

    redraw()
  }

  private createTeamColorMap (tb: TeamBattle) {
    return Object.keys(tb.teams).reduce((acc, team, i) => ({ ...acc, [team]: i }), {} as TeamColorMap)
  }
}
