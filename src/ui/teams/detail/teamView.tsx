import h from 'mithril/hyperscript'
import { header as mainHeader } from '../../shared/common'
import i18n from '../../../i18n'
import { Leader } from '../../../lichess/interfaces/teams'
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
  console.log(team)
  const curMember = true
  return (
    <section>
      <div className='teamInfos'>
        <div> {userStatus(team.leader)} </div>
        <div> {team.nbMembers + ' ' + i18n('members')} </div>
        <div> {team.description} </div>
        {curMember ? renderLeave(ctrl) : renderJoin(ctrl)}
      </div>
    </section>
  )
  
}

function userStatus(leader: Leader) {
  return (
    <div className="user">
      <span> {i18n('teamLeader') + ':'} </span>
      {leader.patron ?
        <span className={'patron userStatus ' + status} data-icon="" /> :
        <span className={'fa fa-circle userStatus ' + status} />
      }
      {leader.title ? <span className="userTitle">{leader.title}&nbsp;</span> : null}
      {leader.name}
    </div>
  )
}

function renderJoin(ctrl: TeamsCtrl) {
  return h('div.teamJoin', [
    h('form', {id: 'joinForm', onSubmit: (e: Event) => {
          e.preventDefault()
          ctrl.join(e.target as HTMLFormElement)
        }}, [
        
    ])
  ])

}
