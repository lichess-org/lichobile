import h from 'mithril/hyperscript'
import { header as mainHeader } from '../../shared/common'
import i18n from '../../../i18n'
import {userStatus} from '../../shared/common'
/*
import * as utils from '../../utils'
import router from '../../router'
import * as helper from '../helper'
import { backArrow } from '../shared/icons'
import settings from '../../settings'
*/

import TeamsCtrl from './TeamCtrl'

export function header(ctrl: TeamsCtrl) {
  const team = ctrl.team
  if (!team)
    return null
  
  return mainHeader(h('div.main_header_title', team.name))
}

export function body(ctrl: TeamsCtrl) {
  const team = ctrl.team
  if (!team)
    return null
  console.log(userStatus(team.leader))
  return (
    <section>
      <div> {i18n('teamLeader') + ':'} {userStatus(team.leader)} </div>
      <div> {team.nbMembers + ' ' + i18n('members')} </div>
      <div> {team.description} </div>
    </section>
  )
  
}