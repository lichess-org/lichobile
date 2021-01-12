import redraw from '../../utils/redraw'
import throttle from 'lodash-es/throttle'
import router from '../../router'
import { Team, TeamResults } from '../../lichess/interfaces/teams'
import * as utils from '../../utils'
import * as xhr from './teamsXhr'
import session from '../../session'

export default class TeamsListCtrl {
  public currentTab: number

  public isSearchOpen = false
  public searchResults?: TeamResults

  public allTeams?: TeamResults
  public myTeams?: ReadonlyArray<Team>

  constructor(defaultTab?: number) {
    this.currentTab = defaultTab || 0

    xhr.getPopularTeams()
    .then(data => {
      this.allTeams = data
      redraw()
    })
    .catch(utils.handleXhrError)

    const user = session.getUserId()
    if (user) {
      xhr.getUserTeams(user)
      .then(data => {
        this.myTeams = data
        redraw()
      })
      .catch(utils.handleXhrError)
    }
  }

  public onTabChange = (tabIndex: number) => {
    const loc = window.location.search.replace(/\?tab=\w+$/, '')
    try {
      window.history.replaceState(window.history.state, '', loc + '?tab=' + tabIndex)
    } catch (e) { console.error(e) }
    this.currentTab = tabIndex
    redraw()
  }

  public closeSearch = (fromBB?: string) => {
    if (fromBB !== 'backbutton' && this.isSearchOpen) router.backbutton.stack.pop()
      this.isSearchOpen = false
  }

  public onInput = throttle((e: Event) => {
    const term = (e.target as HTMLInputElement).value.trim()
    if (term.length >= 3)
      xhr.search(term).then(data => {
        this.searchResults = data
        redraw()
      })
  }, 1000)

  public goSearch = () => {
    router.backbutton.stack.push(this.closeSearch)
    this.isSearchOpen = true
  }

  public goToTeam = (team: Team) => {
    router.set('/teams/' + team.id)
  }

}
