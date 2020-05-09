import h from 'mithril/hyperscript'
import { header as mainHeader } from '../../shared/common'
/*
import * as utils from '../../utils'
import router from '../../router'
import * as helper from '../helper'
import { backArrow } from '../shared/icons'
import settings from '../../settings'
*/

import TeamsCtrl from './TeamCtrl'

export function header(ctrl: TeamsCtrl) {
  const teamId = ctrl.teamDetail
  if (!teamId)
    return null
  
  return mainHeader(h('div.team_main_header', [
    h('div.main_header_title', 'Team Name')
  ]))
}

export function body(ctrl: TeamsCtrl) {
  if (ctrl)
    return null
  return null
  
}