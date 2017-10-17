import router from '../router'
import redraw from '../utils/redraw'
import { timeline as timelineXhr } from '../xhr'
import { gameIcon, handleXhrError } from '../utils'
import { header as headerWidget, backButton } from './shared/common'
import * as helper from './helper'
import layout from './layout'
import i18n from '../i18n'
import * as h from 'mithril/hyperscript'
import * as stream from 'mithril/stream'
import { TimelineEntry } from '../lichess/interfaces'

export const supportedTypes = ['follow', 'game-end', 'tour-join']

interface State {
  timeline: Mithril.Stream<Array<TimelineEntry>>
}

const TimelineScreen: Mithril.Component<{}, State> = {
  oninit(vnode) {
    const timeline = stream([] as TimelineEntry[])

    timelineXhr()
    .then(data => {
      timeline(data.entries.filter(o => supportedTypes.indexOf(o.type) !== -1))
      redraw()
    })
    .catch(handleXhrError)

    vnode.state = {
      timeline
    }
  },

  oncreate: helper.viewFadeIn,

  view() {
    const header = () => headerWidget(null, backButton(i18n('timeline')))
    return layout.free(header, () => renderBody(this))
  }
}

export default TimelineScreen

function renderBody(ctrl: State) {
  return (
    <ul className="timeline native_scroller page">
      {ctrl.timeline().map(e => {
        if (e.type === 'follow') {
          return renderFollow(e)
        } else if (e.type === 'game-end') {
          return renderGameEnd(e)
        } else if (e.type === 'tour-join') {
          return renderTourJoin(e)
        }
        return null
      })}
    </ul>
  )
}

export function renderTourJoin(entry: TimelineEntry) {
  const fromNow = window.moment(entry.date).fromNow()
  const entryText = i18n('xCompetesInY', entry.data.userId, entry.data.tourName)
  const key = 'tour' + entry.date

  return (
    <li className="list_item timelineEntry" key={key}
      oncreate={helper.ontapY(() => {
        router.set('/tournament/' + entry.data.tourId)
      })}
    >
      <span className="fa fa-trophy" />
      {h.trust(entryText.replace(/^(\w+)\s/, '<strong>$1&nbsp;</strong>'))}
      <small><em>&nbsp;{fromNow}</em></small>
    </li>
  )
}

export function renderFollow(entry: TimelineEntry) {
  const fromNow = window.moment(entry.date).fromNow()
  const entryText = i18n('xStartedFollowingY', entry.data.u1, entry.data.u2)
  const key = 'follow' + entry.date

  return (
    <li className="list_item timelineEntry" key={key}
      oncreate={helper.ontapY(() => {
        router.set('/@/' + entry.data.u1)
      })}
    >
      <span className="fa fa-arrow-circle-right" />
      {h.trust(entryText.replace(/^(\w+)\s/, '<strong>$1&nbsp;</strong>'))}
      <small><em>&nbsp;{fromNow}</em></small>
    </li>
  )
}

export function renderGameEnd(entry: TimelineEntry) {
  const icon = gameIcon(entry.data.perf)
  const result = typeof entry.data.win === 'undefined' ? i18n('draw') : (entry.data.win ? 'Victory' : 'Defeat')
  const fromNow = window.moment(entry.date).fromNow()
  const key = 'game-end' + entry.date

  return (
    <li className="list_item timelineEntry" key={key} data-icon={icon}
      oncreate={helper.ontapY(() => {
        router.set('/game/' + entry.data.playerId + '?goingBack=1')
      })}
    >
      <strong>{result}</strong> vs. {entry.data.opponent}
      <small><em>&nbsp;{fromNow}</em></small>
    </li>
  )
}
