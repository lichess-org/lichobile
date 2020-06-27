import h from 'mithril/hyperscript'
import { dropShadowHeader as headerWidget, backButton} from '../../shared/common'
import i18n, { plural } from '../../../i18n'
import { Leader } from '../../../lichess/interfaces/teams'
import TeamsCtrl from './TeamCtrl'

export function header(ctrl: TeamsCtrl) {
  const team = ctrl.team
  if (!team)
    return null

  return headerWidget(null,
      backButton(h('div.main_header_title.withSub', [
        h('h1', [
          team.name
        ])
      ])))
}

export function body(ctrl: TeamsCtrl) {
  const team = ctrl.team
  if (!team)
    return null
  return h('div.teamPage.native_scroller.page', [
    h('section.teamInfos', [
      h('div.teamLeader', team.leaders.map(userStatus)),
      h('div.teamMembers', [team.nbMembers + ' ' + i18n('members')]),
      h('div.teamDescription', [team.description]),
    ]),
    h('section.teamJoinLeave', [
      team.requested ? requestPending() : (team.joined ? renderLeave(ctrl) : renderJoin(ctrl))
    ])
  ])
}

function userStatus(leader: Leader) {
  const patron = leader.patron ? h('span.patron.userStatus', {'data-icon': ''}, []) : null
  const title = leader.title ? h('span.userTitle', [leader.title + ' ']) : null

  return h('div.user', [
    h('span', [plural('teamLeaders', 1) + ': ']),
    patron,
    title,
    leader.name
  ])
}

function renderJoin(ctrl: TeamsCtrl) {
  const team = ctrl.team
  if (!team)
    return null
  const joinMessage = team.open ?
    null
    :
    h('textarea.joinMessage', {id: 'message', minLength: 30, maxLength: 2000}, [
      'Hello, I would like to join the team!'
    ])

  return h('div.teamJoinLeave', [
    h('form', {id: 'joinForm', onsubmit: (e: Event) => {
          e.preventDefault()
          ctrl.join(e.target as HTMLFormElement)
        }}, [
        joinMessage,
        h('button.fatButton.joinLeaveButton', {type: 'submit'}, [
          h('span.fa.fa-check'),
          i18n('joinTeam')
        ])
    ])
  ])
}

function renderLeave(ctrl: TeamsCtrl) {
  const team = ctrl.team
  if (!team)
    return null

  return h('div.teamJoinLeave', [
    h('form', {id: 'leaveForm', onsubmit: (e: Event) => {
          e.preventDefault()
          ctrl.leave()
        }}, [
        h('button.fatButton.joinLeaveButton', {type: 'submit'}, [
          h('span.fa.fa-check'),
          i18n('quitTeam')
        ])
    ])
  ])
}

function requestPending() {
  return h('div.teamRequestPending', [
    h('span', ['Your join request is being reviewed by the team leader.'])
  ])
}
