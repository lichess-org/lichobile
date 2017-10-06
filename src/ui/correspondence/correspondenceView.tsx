import * as h from 'mithril/hyperscript'
import challengesApi from '../../lichess/challenges'
import { lightPlayerName } from '../../lichess/player'
import { CorrespondenceSeek } from '../../lichess/interfaces'
import { Challenge } from '../../lichess/interfaces/challenge'
import * as helper from '../helper'
import i18n from '../../i18n'
import session from '../../session'
import loginModal from '../loginModal'
import newGameForm from '../newGameForm'
import TabNavigation from '../shared/TabNavigation'
import TabView from '../shared/TabView'

import CorrespondenceCtrl from './CorrespondenceCtrl'

const tabButtons = [
  {
    label: 'Public games'
  },
  {
    label: 'Challenges'
  }
]

export function renderBody(ctrl: CorrespondenceCtrl) {
  if (!session.isConnected()) {
    return [
      h('div.seeks.disconnected', [
        h('div.seeks_background'),
        h('div.seeks_scroller', [
          h('div.vertical_align.must_signin', i18n('mustSignIn'))
        ]),
        h('button.fat', {
          key: 'seeks_login',
          oncreate: helper.ontap(loginModal.open)
        }, i18n('logIn'))
      ])
    ]
  }

  const tabsBar = h(TabNavigation, {
    buttons: tabButtons,
    selectedIndex: ctrl.currentTab,
    onTabChange: ctrl.onTabChange
  })

  const tabsContent = [
    ctrl.pool,
    ctrl.sendingChallenges
  ]

  return [
    h('div.tabs-nav-header', tabsBar, h('div.main_header_drop_shadow')),
    h(TabView, {
      className: 'correspondence-tabs',
      selectedIndex: ctrl.currentTab,
      content: tabsContent,
      renderer: (tab: any, i: number) => renderTabContent(ctrl, tab, i),
      onTabChange: ctrl.onTabChange
    })
  ]
}

export function renderFooter() {
  return h('div.actions_bar', h('button.action_create_button', {
    oncreate: helper.ontap(newGameForm.openCorrespondence)
  }, [h('span.fa.fa-plus-circle'), i18n('createAGame')]))
}

function renderTabContent(ctrl: CorrespondenceCtrl, tab: any, index: number) {
  if (index === 0) {
    return renderPool(tab, ctrl)
  } else {
    return renderChallenges(tab, ctrl)
  }
}

function renderChallenges(challenges: Challenge[], ctrl: CorrespondenceCtrl) {
  return challenges.length ?
    h('ul.native_scroller.seeks_scroller', challenges.map(c => renderChallenge(ctrl, c))) :
    h('div.vertical_align.empty_seeks_list', 'Oops! Nothing here.')
}

function renderPool(pool: CorrespondenceSeek[], ctrl: CorrespondenceCtrl) {
  return pool.length ?
    h('ul.native_scroller.seeks_scroller', pool.map(s => renderSeek(ctrl, s))) :
    h('div.vertical_align.empty_seeks_list', 'Oops! Nothing here.')
}

function renderChallenge(ctrl: CorrespondenceCtrl, c: Challenge) {
  const playerName = c.destUser && lightPlayerName(c.destUser)
  return (
    <li id={c.id} key={'challenge' + c.id} className="list_item sendingChallenge"
      oncreate={helper.ontapY(
        helper.fadesOut(() => ctrl.cancelChallenge(c.id), '.sendingChallenge', 300)
      )}
    >
      <div className="icon" data-icon={c.perf.icon} />
      <div className="body">
        <div className="player">
          {playerName ? i18n('youAreChallenging', playerName) : 'Open challenge'}
        </div>
        <div className="variant">
          {c.variant.name}
        </div>
        <div className="time">
          {challengesApi.challengeTime(c)}, {i18n(c.rated ? 'rated' : 'casual')}
        </div>
      </div>
    </li>
  )
}

function renderSeek(ctrl: CorrespondenceCtrl, seek: CorrespondenceSeek) {
  const action = seek.username.toLowerCase() === session.getUserId() ? 'cancel' : 'join'
  return h('li', {
    key: 'seek' + seek.id,
    'id': seek.id,
    className: 'list_item seek ' + action,
    oncreate: helper.ontapY(() => ctrl[action](seek.id))
  }, [
    h('div.icon', {
      'data-icon': seek.perf.icon
    }),
    h('div.body', [
      h('div.player', seek.username + ' (' + seek.rating + ')'),
      h('div.variant', seek.variant.name),
      h('div.time', [
        seek.days ? i18n(seek.days === 1 ? 'oneDay' : 'nbDays', seek.days) : '∞',
        ', ',
        i18n(seek.mode === 1 ? 'rated' : 'casual')
      ])
    ])
  ])
}
