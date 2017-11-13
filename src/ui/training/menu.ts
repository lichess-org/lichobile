import * as h from 'mithril/hyperscript'
import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import { area as d3Area } from 'd3-shape'
import { axisLeft } from 'd3-axis'
import i18n from '../../i18n'
import router from '../../router'
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
}

export default {

  controller(root: TrainingCtrl): IMenuCtrl {
    let isOpen = false

    function open() {
      router.backbutton.stack.push(close)
      isOpen = true
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
      isOpen = false
    }

    return {
      open,
      close,
      isOpen: () => isOpen,
      root
    }
  },

  view(ctrl: IMenuCtrl) {
    return popupWidget(
      'trainingMenu',
      undefined,
      () => renderTrainingMenu(ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    )
  }
}

function renderTrainingMenu(ctrl: TrainingCtrl) {
  if (ctrl.data && ctrl.data.user) {
    return renderUserInfos(ctrl.data.user)
  } else {
    return renderSigninBox()
  }
}

function renderSigninBox() {
  return h('div.trainingMenuContent', [
    h('p', i18n('toTrackYourProgress')),
    h('p',
      h('button', {
        oncreate: helper.ontap(loginModal.open)
      }, [h('span.fa.fa-user'), i18n('signIn')])
    ),
    h('p', i18n('trainingSignupExplanation'))
  ])
}

function renderUserInfos(user: PuzzleUserData) {
  const { vw } = helper.viewportDim()
  let width: number
  // see overlay-popup.styl for popup width
  if (vw >= 900) width = vw * 0.4
  else if (vw >= 800) width = vw * 0.45
  else if (vw >= 700) width = vw * 0.5
  else if (vw >= 600) width = vw * 0.55
  else if (vw >= 500) width = vw * 0.6
  else width = vw * 0.85
  const height = 200
  return [
    h('p.trainingRatingHeader', h.trust(i18n('yourPuzzleRatingX', `<strong>${user.rating}</strong>`))),
    user.recent ? h('svg#training-graph', {
      width,
      height,
      oncreate() {
        drawChart(user)
      }
    }) : null,
    renderRecent(user)
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

function drawChart(user: PuzzleUserData) {
  const history = Array.from(user.recent.map(x => x[2]))
  history.push(user.rating)
  const data = history.map((x, i) => [i + 1, x])
  const graph = select('#training-graph')
  const margin = {top: 5, right: 20, bottom: 5, left: 35}
  const width = +graph.attr('width') - margin.left - margin.right
  const height = +graph.attr('height') - margin.top - margin.bottom
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
  .attr('d', area)

  g.append('path')
  .attr('class', 'line')
  .attr('d', line)
}
