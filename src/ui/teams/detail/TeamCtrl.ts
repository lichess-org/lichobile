import redraw from '../../../utils/redraw'
import { TeamDetail } from '../../../lichess/interfaces/teams'
import * as utils from '../../../utils'
import * as xhr from '../teamsXhr'

export default class TeamCtrl {

  public teamDetail?: TeamDetail
  
  constructor(teamId: string) {
    xhr.getTeam(teamId)
    .then(data => {
      console.log(data)
      this.teamDetail = data
      redraw()
    })
    .catch(utils.handleXhrError)
  }
}
