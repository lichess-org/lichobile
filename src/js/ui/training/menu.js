import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import { area } from 'd3-shape'
import { axisLeft } from 'd3-axis'
import i18n from '../../i18n'
import loginModal from '../loginModal'
import popupWidget from '../shared/popup'
import router from '../../router'
import * as helper from '../helper'
import * as h from 'mithril/hyperscript'

export default {

  controller: function(root) {
    let isOpen = false

    function open() {
      router.backbutton.stack.push(close)
      isOpen = true
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
      isOpen = false
    }

    return {
      open: open,
      close: close,
      isOpen: function() {
        return isOpen
      },
      root
    }
  },

  view: function(ctrl) {
    return popupWidget(
      'trainingMenu',
      null,
      renderTrainingMenu.bind(undefined, ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    )
  }
}

export function renderUserInfos(ctrl) {
  const { vw } = helper.viewportDim()
  const width = vw * 0.85
  const height = 200
  return [
    h('p.trainingRatingHeader', h.trust(i18n('yourPuzzleRatingX', `<strong>${ctrl.data.user.rating}</strong>`))),
    ctrl.data.user.history ? h('svg#training-graph', {
      width,
      height,
      oncreate() {
        drawChart(ctrl)
      }
    }) : null
  ]
}

export function renderSigninBox() {
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

function drawChart(ctrl) {
  const data = ctrl.data.user.history.map((x, i) => [i + 1, x])
  const graph = select('#training-graph')
  const margin = {top: 0, right: 20, bottom: 15, left: 35}
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

  const l = area()
  .x(d => scaleX(d[0]))
  .y0(height)
  .y1(d => scaleY(d[1]))

  const yAxis = axisLeft(scaleY)
  .tickFormat(d => String(d))

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
  .attr('d', l(data))
}

function renderTrainingMenu(ctrl) {
  if (ctrl.data && ctrl.data.user) {
    return renderUserInfos(ctrl)
  } else {
    return renderSigninBox()
  }
}
