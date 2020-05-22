import redraw from '../../../utils/redraw'
import { Team, TeamJoinLeaveResponse } from '../../../lichess/interfaces/teams'
import * as utils from '../../../utils'
import * as xhr from '../teamsXhr'
import { Plugins } from '@capacitor/core'

export default class TeamCtrl {

  public teamId: string
  public team?: Team

  constructor(teamId: string) {
    this.teamId = teamId
    xhr.getTeam(teamId)
    .then(data => {
      console.log(data)
      this.team = data
      redraw()
    })
    .catch(utils.handleXhrError)
  }

  join(form: HTMLFormElement) {
    const message = (form[0] as HTMLInputElement).value
    xhr.joinTeam(message)
    .then((data: TeamJoinLeaveResponse) => {
      if (!data.ok) {
        Plugins.LiToast.show({ text: 'Join failed', duration: 'short' })
      }
      this.reload(this.teamId)
    })
    .catch(utils.handleXhrError)
  }

  reload(teamId: string) {
    xhr.getTeam(teamId)
    .then(data => {
      console.log(data)
      this.team = data
      redraw()
    })
    .catch(utils.handleXhrError)
  }