import h from 'mithril/hyperscript'
import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import { area as d3Area } from 'd3-shape'
import { axisLeft } from 'd3-axis'
import session from '../../session'
import i18n from '../../i18n'
import router from '../../router'
import { hasNetwork } from '../../utils'
import redraw from '../../utils/redraw'
import { UserData as PuzzleUserData } from '../../lichess/interfaces/training'
import loginModal from '../loginModal'
import popupWidget from '../shared/popup'
import * as helper from '../helper'

import TrainingCtrl from './TrainingCtrl'

export interface IMenuCtrl {
  open: () => void
  close: () => void
  isOpen: () => boolean
  root: TrainingCtrl
  user: () => OfflineUser | null
}

interface OfflineUser {
  username: string
  data: PuzzleUserData
}

export default {

  controller(root: TrainingCtrl): IMenuCtrl {
    let isOpen = false
    let puzzleUser: OfflineUser | null = null

    function open() {
      router.backbutton.stack.push(close)
      isOpen = true

      const user = session.get()
      if (user) {
        root.database.fetch(user.id)
        .then(data => {
          if (data) {
            puzzleUser = {
              username: user.username,
              data: data.user,
            }
            redraw()
          }
        })
      }
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
      isOpen = false
    }

    return {
      open,
      close,
      isOpen: () => isOpen,
      user: () => puzzleUser,
      root,
    }
  },

  view(ctrl: IMenuCtrl) {
    return popupWidget(
      'trainingMenu',
      undefined,
      () => renderTrainingMenu(ctrl),
      ctrl.isOpen(),
      ctrl.close
    )
  }
}

function renderTrainingMenu(ctrl: IMenuCtrl) {
  const puzzleUser = ctrl.user()

  if (ctrl.root.data && ctrl.root.data.user && hasNetwork()) {
    return renderUserInfosOnline(ctrl.root.data.user)
  }
  else if (puzzleUser !== null && hasNetwork()) {
    return renderUserInfosOnline(puzzleUser.data)
  }
  else if (puzzleUser !== null) {
    return renderUserInfosOffline(puzzleUser, ctrl)
  }
  else {
    return renderSigninBox()
  }
}

function renderSigninBox() {
  return h('div.trainingMenuContent', [
    h('p', i18n('toTrackYourProgress')),
    h('p.signin',
      h('button.defaultButton', {
        oncreate: helper.ontap(loginModal.open)
      }, [h('span.fa.fa-user'), i18n('signIn')])
    ),
  ])
}

function renderUserInfosOffline(user: OfflineUser, ctrl: IMenuCtrl) {
  const rating = user.data.rating
  return h('div.training-offlineInfos', [
    h('p', ['You are currently offline. Your last recorded rating as ', h('strong', user.username), ' is ', h('strong', rating), '.']),
    h('p', 'You still have ', h('strong', ctrl.root.nbUnsolved), ' saved puzzles to solve.'),
    h('p', 'Puzzles are automatically downloaded by batches so you can solve them seamlessly while having bad network conditions or when you are offline.'),
    h('p', 'Your puzzle history and rating will be updated as soon as you are back online.'),
  ])
}

function renderUserInfosOnline(user: PuzzleUserData) {
  const rating = user.rating
  return [
    h('p.trainingRatingHeader', h.trust(i18n('yourPuzzleRatingX', `<strong>${rating}</strong>`))),
    user.recent ? h('div#training-graph.training-graph', {
      oncreate({ dom }) {
        drawChart(dom as HTMLElement, user)
      }
    }) : null,
    renderRecent(user),
  ]
}

function onRecentTap(e: TouchEvent) {
  const button = helper.getButton(e)
  const id = button && (button.dataset as DOMStringMap).id
  if (id) router.set(`/training/${id}`, true)
}

function renderRecent(user: PuzzleUserData) {
  return h('div.puzzle-recents', {
    oncreate: helper.ontapY(onRecentTap, undefined, helper.getButton)
  }, user.recent.map(([id, diff]) => h('button', {
      'data-id': id,
      className: diff > 0 ? 'up' : 'down'
    }, (diff > 0 ? '+' : '') + diff))
  )
}

function drawChart(element: HTMLElement, user: PuzzleUserData) {
  const history = Array.from(user.recent.map(x => x[2]))
  const rating = user.rating
  if (rating !== undefined) {
    history.push(rating)
  }
  const rect = element.getBoundingClientRect()
  const data = history.map((x, i) => [i + 1, x])
  const margin = {top: 5, right: 5, bottom: 5, left: 35}
  const width = rect.width - margin.left - margin.right
  const height = rect.height - margin.top - margin.bottom
  const graph = select(element)
  .append('svg')
  .attr('viewBox', `0 0 ${rect.width} ${rect.height}`)
  const g = graph.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  const xvalues = data.map(d => d[0])
  const scaleX = scaleLinear()
  .domain([Math.min.apply(null, xvalues), Math.max.apply(null, xvalues)])
  .rangeRound([0, width])

  const yvalues = data.map(d => d[1])
  const scaleY = scaleLinear()
  .domain([Math.min.apply(null, yvalues) - 10, Math.max.apply(null, yvalues) + 10])
  .rangeRound([height, 0])

  const area = d3Area()
  .x(d => scaleX(d[0]))
  .y0(height)
  .y1(d => scaleY(d[1]))

  const line = d3Area()
  .x(d => scaleX(d[0]))
  .y(d => scaleY(d[1]))

  const yAxis = axisLeft(scaleY)
  .tickFormat(d => String(d))

  g.datum(data)

  g.append('g')
  .attr('class', 'ticks')
  .call(yAxis)
  .append('text')
  .attr('class', 'legend')
  .attr('transform', 'rotate(-90)')
  .attr('y', 6)
  .attr('dy', '0.71em')
  .attr('text-anchor', 'end')
  .text(i18n('rating'))

  g.append('path')
  .attr('class', 'path')
  .attr('fill', 'steelblue')
  .attr('stroke', 'steelblue')
  .attr('stroke-linejoin', 'round')
  .attr('stroke-linecap', 'round')
  .attr('stroke-width', 0)
  .attr('d', area as any)

  g.append('path')
  .attr('class', 'line')
  .attr('d', line as any)
}
