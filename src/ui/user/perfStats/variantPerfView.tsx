import h from 'mithril/hyperscript'
import { select } from 'd3-selection'
import { scaleTime, scaleLinear } from 'd3-scale'
import { line } from 'd3-shape'
import { axisLeft, axisBottom } from 'd3-axis'
import { timeFormat } from 'd3-time-format'
import { timeMonth, timeYear } from 'd3-time'
import router from '../../../router'
import i18n from '../../../i18n'
import * as helper from '../../helper'
import { GraphPoint } from '../../../lichess/interfaces/user'

import { State } from './perfStats'

interface DateRating {
  date: Date
  rating: number
}
type GraphData = Array<DateRating>

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365

export function renderBody(ctrl: State) {
  const data = ctrl.perfData()

  if (!data) return null

  const days = Math.floor(data.stat.count.seconds / (60 * 60 * 24))
  const hours = Math.floor(data.stat.count.seconds / (60 * 60)) - days * 24
  const mins = Math.floor(data.stat.count.seconds / 60) - days * 24 * 60 - hours * 60
  const now = Date.now()
  const yearsAgo = now - (ONE_YEAR * 3)
  const graphData = smoothGraphData(data.graph
    .map(normalizeGraphData)
    .filter(d => d.date.getTime() > yearsAgo))

  const { vw } = helper.viewportDim()

  return (
    <div class="variantPerfBody native_scroller page">
      {graphData && graphData.length >= 3 ?
        <div>
          <svg
            width={vw - 20}
            height="230"
            id="variantPerf-graph"
            className="variantPerf-graph"
            oncreate={({ dom }: Mithril.VnodeDOM<any, any>) => delayDrawChart(graphData, dom as SVGElement)}
            key={'graph_' + helper.isPortrait() ? 'portrait' : 'landscape'}
          />
        </div> : null
      }
      <table class="variantPerf">
        <tbody>
        <tr>
          <th class="variantPerfHeading" colspan="3"> Current Rating </th>
        </tr>
        <tr>
          <th class="variantPerf"> {i18n('rating')} </th>
          <td class="variantPerf"> {data.perf.glicko.rating + (data.perf.glicko.provisional ? '?' : '')} </td>
          <td> </td>
        </tr>
        <tr class={isEmpty(data.perf.progress)}>
          <th class="variantPerf"> Last 12 games progress </th>
          <td class="variantPerf"> {helper.progress(data.perf.progress)} </td>
          <td> </td>
        </tr>
        <tr class={isEmpty(data.rank)}>
          <th class="variantPerf"> {i18n('rank')} </th>
          <td class="variantPerf"> {data.rank === null ? '' : data.rank} </td>
          <td> </td>
        </tr>
        <tr class={isEmpty(data.percentile)}>
          <th class="variantPerf"> Percentile </th>
          <td class="variantPerf"> {data.percentile === null ? '' : (data.percentile + '%')} </td>
          <td> </td>
        </tr>
        <tr> <td class="variantPerfSpacer" colspan="3"> </td> </tr>
        <tr>
          <th class="variantPerfHeading" colspan="3">{i18n('ratingStats')}</th>
        </tr>
        <tr>
          <th class="variantPerf"> Avg opponent {i18n('rating').toLowerCase()} </th>
          <td class="variantPerf"> {data.stat.count.opAvg} </td>
          <td> </td>
        </tr>
        <tr class={isEmpty(data.stat.highest)}>
          <th class="variantPerf"> Highest {i18n('rating').toLowerCase()} </th>
          <td class="variantPerf"> <span class="progress positive"> {data.stat.highest ? data.stat.highest.int : ''} </span> </td>
          <td class="variantPerf"> <span class="progress positive"> {data.stat.highest ? data.stat.highest.at.substring(0, 10) : ''} </span> </td>
        </tr>
        <tr class={isEmpty(data.stat.lowest)}>
          <th class="variantPerf"> Lowest {i18n('rating').toLowerCase()} </th>
          <td class="variantPerf"> <span class="progress positive"> {data.stat.lowest ? data.stat.lowest.int : ''} </span> </td>
          <td class="variantPerf"> <span class="progress positive"> {data.stat.lowest ? data.stat.lowest.at.substring(0, 10) : ''} </span> </td>
        </tr>
        <tr>
          <th class="variantPerf"> {i18n('tpTimeSpentPlaying', 0).split(':')[0]} </th>
          <td class="variantPerf" colspan="2"> { (days > 0 ? (days + 'd, ') : '') + hours + 'h, ' + mins + 'm' } </td>
        </tr>
        <tr> <td class="variantPerfSpacer" colspan="3"> </td> </tr>
        <tr>
          <th class="variantPerfHeading" colspan="3"> Game Stats </th>
        </tr>
        <tr>
          <th class="variantPerf"> {i18n('wins')} </th>
          <td class="variantPerf"> <span class="progress positive"> {data.stat.count.win} </span> </td>
          <td class="variantPerf"> <span class="progress positive"> {Math.round((data.stat.count.win / data.stat.count.all) * 100) + '%'} </span> </td>
        </tr>
        <tr>
          <th class="variantPerf"> {i18n('draws')} </th>
          <td class="variantPerf"> {data.stat.count.draw} </td>
          <td class="variantPerf"> {Math.round((data.stat.count.draw / data.stat.count.all) * 100) + '%'} </td>
        </tr>
        <tr>
          <th class="variantPerf"> {i18n('losses')} </th>
          <td class="variantPerf sumLine"> <span class="progress negative"> {data.stat.count.loss} </span> </td>
          <td class="variantPerf"> <span class="progress negative"> {Math.round((data.stat.count.loss / data.stat.count.all) * 100) + '%'} </span> </td>
        </tr>
        <tr>
          <th class="variantPerf"> Total </th>
          <td class="variantPerf"> {data.stat.count.all} </td>
          <td> </td>
        </tr>
        <tr>
          <th class="variantPerfMemo"> {i18n('rated')} </th>
          <td class="variantPerfMemo"> {data.stat.count.rated} </td>
          <td class="variantPerfMemo"> {Math.round((data.stat.count.rated / data.stat.count.all) * 100) + '%'} </td>
        </tr>
        <tr>
          <th class="variantPerfMemo"> {i18n('tournament')} </th>
          <td class="variantPerfMemo"> {data.stat.count.tour} </td>
          <td class="variantPerfMemo"> {Math.round((data.stat.count.tour / data.stat.count.all) * 100) + '%'} </td>
        </tr>
        <tr>
          <th class="variantPerfMemo"> Berserk </th>
          <td class="variantPerfMemo"> {data.stat.count.berserk} </td>
          <td class="variantPerfMemo"> {Math.round((data.stat.count.berserk / data.stat.count.all) * 100) + '%'} </td>
        </tr>
        <tr>
          <th class="variantPerfMemo"> Disconnect </th>
          <td class="variantPerfMemo" > {data.stat.count.disconnects} </td>
          <td class="variantPerfMemo"> {Math.round((data.stat.count.disconnects / data.stat.count.all) * 100) + '%'} </td>
        </tr>
        <tr> <td class="variantPerfSpacer" colspan="3"> </td> </tr>
        <tr>
          <th class="variantPerfHeading" colspan="3"> Streaks </th>
        </tr>
        <tr class={isEmpty(data.stat.playStreak)}>
          <th class="variantPerf"> Playing streak </th>
          <td class="variantPerf"> {data.stat.playStreak.nb.max.v} </td>
          <td class="variantPerf"> {data.stat.playStreak.nb.max.from.at && data.stat.playStreak.nb.max.from.at.substring(0, 10)} </td>
        </tr>
        <tr class={isEmpty(data.stat.resultStreak.win.max.v)}>
          <th class="variantPerf"> {i18n('winStreak')} </th>
          <td class="variantPerf"> <span class="progress positive"> {data.stat.resultStreak.win.max.v ? data.stat.resultStreak.win.max.v : ''} </span> </td>
          <td class="variantPerf"> <span class="progress positive"> {data.stat.resultStreak.win.max.to ? data.stat.resultStreak.win.max.to.at.substring(0, 10) : ''} </span> </td>
        </tr>
        <tr class={isEmpty(data.stat.resultStreak.loss.max.v)}>
          <th class="variantPerf"> Losing streak </th>
          <td class="variantPerf"> <span class="progress negative"> {data.stat.resultStreak.loss.max.v ? data.stat.resultStreak.loss.max.v : ''} </span> </td>
          <td class="variantPerf"> <span class="progress negative"> {data.stat.resultStreak.loss.max.to ? data.stat.resultStreak.loss.max.to.at.substring(0, 10) : ''} </span> </td>
        </tr>
        <tr> <td class="variantPerfSpacer" colspan="3"> </td> </tr>
        </tbody>
      </table>
      <div class={'variantPerfGames noPadding ' + isEmpty(data.stat.bestWins.results.length)}>
        <div class="variantPerfHeading"> Best Wins </div>
        {data.stat.bestWins.results.map((p: any) => renderGame(p))}
      </div>
    </div>
  )
}

function renderGame(game: any) {
  const opp = (game.opId.title === null ? '' : game.opId.title) + ' ' + game.opId.name
  const date = game.at.substring(0, 10)
  const gameId = game.gameId

  return (
    <div class="list_item nav" oncreate={helper.ontapY(() => router.set('/analyse/online/' + gameId))}>
      {opp} ({date})
    </div>
  )
}

function isEmpty(element: any) {
  if (!element)
    return 'empty'
  else
    return ''
}

function delayDrawChart(graphData: GraphData, el: SVGElement) {
  setTimeout(() => drawChart(graphData, el), 500)
}

function drawChart(graphData: GraphData, el: SVGElement) {
  if (el) {
    const graph = select(el)
    const margin = {top: 0, right: 20, bottom: 40, left: 30}
    const width = +graph.attr('width') - margin.left - margin.right
    const height = +graph.attr('height') - margin.top - margin.bottom
    const g = graph.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    const scaleX = scaleTime()
    .domain([graphData[0].date, graphData[graphData.length - 1].date])
    .rangeRound([0, width])

    const values = graphData.map(p => p.rating)
    const scaleY = scaleLinear()
    .domain([Math.min.apply(null, values) - 50, Math.max.apply(null, values) + 50])
    .rangeRound([height, 0])

    const l = line<DateRating>()
    .x(d => scaleX(d.date))
    .y(d => scaleY(d.rating))

    const yAxis = axisLeft(scaleY)
    .tickFormat(d => String(d))

    const xAxis = axisBottom<Date>(scaleX)
    .tickFormat(multiFormat)

    g.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .selectAll('text')
    .attr('y', 0)
    .attr('x', 9)
    .attr('dy', '.35em')
    .attr('transform', 'rotate(60)')
    .style('text-anchor', 'start')
    .select('.domain')
    .remove()

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
    .attr('fill', 'none')
    .attr('stroke', 'blue')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')
    .attr('stroke-width', 1.5)
    .attr('d', l(graphData) as string)
  }
}

function normalizeGraphData(i: GraphPoint): DateRating {
  return { date: new Date(i[0], i[1], i[2]), rating: i[3] }
}

function smoothGraphData(graphData: GraphData): GraphData {
  const copy = graphData.slice()
  const reversed = graphData.slice().reverse()
  const startDate = copy[0].date
  const endDate = copy[copy.length - 1].date

  const allDates: Array<Date> = []
  for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
        allDates.push(new Date(dt))
  }

  const result: Array<DateRating> = []
  allDates.forEach((dt) => {
    const match = reversed.find((rev) => rev.date <= dt)
    match && result.push({date: dt, rating: match.rating})
  })

  return result
}

const formatWeek = timeFormat('%b %d')
const formatMonth = timeFormat('%b')
const formatYear = timeFormat('%Y')

function multiFormat(date: Date): string {
 return (timeMonth(date) < date ? formatWeek
    : timeYear(date) < date ? formatMonth
    : formatYear)(date)
}
