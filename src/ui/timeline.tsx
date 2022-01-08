import h from 'mithril/hyperscript'
import router from '../router'
import redraw from '../utils/redraw'
import { timeline as timelineXhr } from '../xhr'
import { gameIcon, handleXhrError, prop, Prop } from '../utils'
import { openWebsitePage } from '../utils/browse'
import { dropShadowHeader as headerWidget, backButton } from './shared/common'
import * as helper from './helper'
import layout from './layout'
import i18n, { fromNow } from '../i18n'
import { TimelineData, TimelineEntry } from '../lichess/interfaces'
import { userTitle } from './user/userView'
import { LightUser } from '~/lichess/interfaces/user'

export const supportedTypes = ['follow', 'game-end', 'tour-join', 'study-create', 'study-like', 'forum-post', 'blog-post', 'ublog-post', 'ublog-post-like']

type LightUserMap = {[username: string]: LightUser}
interface State {
  timelineData: Prop<TimelineData>
}

export default {
  oninit() {
    this.timelineData = prop<TimelineData>({ entries: [], users: {} })

    timelineXhr()
      .then((data: TimelineData) => {
        this.timelineData(
          {
            users: data.users,
            entries: data.entries
              .filter(o => supportedTypes.indexOf(o.type) !== -1)
              .map(o => {
                o.fromNow = fromNow(new Date(o.date))
                return o
              })
          }
        )
        redraw()
      })
      .catch(handleXhrError)
  },

  oncreate: helper.viewFadeIn,

  view() {
    const header = headerWidget(null, backButton(i18n('timeline')))
    const timelineData = this.timelineData()
    return layout.free(header, [
      h('ul.timeline.native_scroller.page', {
        oncreate: helper.ontapY(timelineOnTap, undefined, helper.getLI)
      }, timelineData.entries.map(entry => renderTimelineEntry(entry, timelineData.users)))
    ])
  }
} as Mithril.Component<Record<string, never>, State>

export function timelineOnTap(e: Event) {
  const el = helper.getLI(e)
  const path = el && el.dataset.path
  const external = el && el.dataset.external
  if (path) {
    router.set(path)
  }
  if (external) {
    openWebsitePage(external)
  }
}

export function renderTimelineEntry(e: TimelineEntry, users: LightUserMap) {
  switch (e.type) {
    case 'follow':
      return renderFollow(e)
    case 'game-end':
      return renderGameEnd(e)
    case 'tour-join':
      return renderTourJoin(e)
    case 'study-create':
    case 'study-like':
      return renderStudy(e)
    case 'forum-post':
      return renderForum(e, users)
    case 'blog-post':
      return renderBlog(e)
    case 'ublog-post':
      return renderUblog(e, users)
    case 'ublog-post-like':
      return renderUblogLike(e, users)
    default:
      return null
  }
}

function renderBlog(entry: TimelineEntry) {
  const data = entry.data
  return h('li.list_item.timelineEntry.blogEntry', {
    key: 'blog-post' + data.id,
    'data-external': `/blog/${data.id}/${data.slug}`,
  }, [
    h('span[data-icon=6].withIcon'),
    h('span', data.title),
    ' ',
    h('small', h('em', entry.fromNow)),
  ])
}

function renderUblog(entry: TimelineEntry, users: LightUserMap) {
  const data = entry.data
  const actor = users[data.userId]
  return h('li.list_item.timelineEntry', {
    key: `ublog-post${data.id}`,
    'data-external': `/@/${data.userId}/blog/${data.slug}/${data.id}`,
  }, [
    userTitle(false, actor.patron ?? false, actor.id, actor.title),
    h.trust(i18n('xPublishedY', '', `<strong>${data.title}</strong>`)),
    ' ',
    h('small', h('em', entry.fromNow)),
  ])
}

function renderUblogLike(entry: TimelineEntry, users: LightUserMap) {
  const data = entry.data
  const actor = users[data.userId]
  return h('li.list_item.timelineEntry', {
    key: `ublog-post${data.id}`,
    'data-external': `/ublog/${data.id}/redirect`,
  }, [
    userTitle(false, actor.patron ?? false, actor.id, actor.title),
    h.trust(i18n('xLikesY', '', `<strong>${data.title}</strong>`)),
    ' ',
    h('small', h('em', entry.fromNow)),
  ])
}

function renderForum(entry: TimelineEntry, users: LightUserMap) {
  const data = entry.data
  const actor = users[data.userId]
  return h('li.list_item.timelineEntry', {
    key: 'forum-post' + data.postId,
    'data-external': `/forum/redirect/post/${data.postId}`,
  }, [
    userTitle(false, actor.patron ?? false, actor.id, actor.title),
    h.trust(i18n('xPostedInForumY', '', `<strong>${data.topicName}</strong>`)),
    ' ',
    h('small', h('em', entry.fromNow)),
  ])
}

function renderStudy(entry: TimelineEntry) {
  const data = entry.data
  const eType = entry.type === 'study-create' ? 'hosts' : 'likes'
  return h('li.list_item.timelineEntry', {
    key: 'study-like' + entry.date,
    'data-path': `/study/${data.studyId}`
  }, [
    h('span[data-icon=4].withIcon'),
    h('strong', data.userId),
    h('span', ` ${eType} ${data.studyName} `),
    h('small', h('em', entry.fromNow)),
  ])
}

function renderTourJoin(entry: TimelineEntry) {
  const entryText = i18n('xCompetesInY', entry.data.userId, entry.data.tourName)
  const key = 'tour' + entry.date

  return (
    <li className="list_item timelineEntry" key={key}
      data-path={`/tournament/${entry.data.tourId}`}
    >
      <span className="fa fa-trophy" />
      {h.trust(entryText.replace(/^(\w+)\s/, '<strong>$1&nbsp;</strong>'))}
      <small><em> {entry.fromNow}</em></small>
    </li>
  )
}

function renderFollow(entry: TimelineEntry) {
  const entryText = i18n('xStartedFollowingY', entry.data.u1, entry.data.u2)
  const key = 'follow' + entry.date

  return (
    <li className="list_item timelineEntry" key={key}
      data-path={`/@/${entry.data.u2}`}
    >
      <span className="fa fa-arrow-circle-right" />
      {h.trust(entryText.replace(/^(\w+)\s/, '<strong>$1&nbsp;</strong>'))}
      <small><em> {entry.fromNow}</em></small>
    </li>
  )
}

function renderGameEnd(entry: TimelineEntry) {
  const icon = gameIcon(entry.data.perf)
  const result = typeof entry.data.win === 'undefined' ? i18n('draw') : (entry.data.win ? 'Victory' : 'Defeat')
  const key = 'game-end' + entry.date

  return (
    <li className="list_item timelineEntry" key={key} data-icon={icon}
      data-path={`/game/${entry.data.playerId}?goingBack=1`}
    >
      <strong>{result}</strong> vs. {entry.data.opponent}
      <small><em> {entry.fromNow}</em></small>
    </li>
  )
}
