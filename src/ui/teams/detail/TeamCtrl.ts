import redraw from '../../../utils/redraw'
import { Team } from '../../../lichess/interfaces/teams'
import * as utils from '../../../utils'
import * as xhr from '../teamsXhr'

export default class TeamCtrl {

  public team?: Team

  constructor(teamId: string) {
    xhr.getTeam(teamId)
    .then(data => {
      console.log(data)
      this.team = data
      redraw()
    })
    .catch(utils.handleXhrError)
  }
}
