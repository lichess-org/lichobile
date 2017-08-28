import redraw from '../../utils/redraw'
import settings from '../../settings'
import { handleXhrError, loadLocalJsonFile } from '../../utils'
import * as xhr from './tournamentXhr'
import { TournamentListItem, TournamentLists } from '../../lichess/interfaces/tournament'

export default class TournamentCtrl {
  tournaments: TournamentLists
  currentTab: string
  startPositions: BoardPositionCategory[]

  constructor(defaultTab: string) {
    this.currentTab = defaultTab || 'started'

    xhr.currentTournaments()
    .then(data => {
      data.started = data.started.filter(supported)
      data.created = data.created.filter(supported)
      data.finished = data.finished.filter(supported)
      data.started.sort(sortByLichessAndDate)
      data.finished.sort(sortByEndDate)
      this.tournaments = data
      redraw()
    })
    .catch(handleXhrError)

    loadLocalJsonFile<BoardPositionCategory[]>('data/positions.json')
    .then(data => {
      this.startPositions = data
      redraw()
    })
  }
}

function supported(t: TournamentListItem) {
  return settings.game.supportedVariants.indexOf(t.variant.key) !== -1
}

function sortByLichessAndDate(a: TournamentListItem, b: TournamentListItem) {
  if (a.createdBy === 'lichess' && b.createdBy === 'lichess') {
    return a.startsAt - b.startsAt
  } else if (a.createdBy === 'lichess') {
    return -1
  } else {
    return 1
  }
}

function sortByEndDate(a: TournamentListItem, b: TournamentListItem) {
  return b.finishesAt - a.finishesAt
}
