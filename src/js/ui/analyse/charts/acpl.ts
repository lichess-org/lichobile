import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import { area as d3Area } from 'd3-shape'

import { AnalyseData } from '../../../lichess/interfaces/analyse'

interface Point {
  name?: string
  acpl: number
}

export default function drawAcplChart(element: SVGElement, aData: AnalyseData) {
  const opening = aData.game.opening
  const division = aData.game.division

  const graph = select(element)
  const graphData = makeSerieData(aData)
  const margin = {top: 10, right: 20, bottom: 10, left: 20}
  const width = +graph.attr('width') - margin.left - margin.right
  const height = +graph.attr('height') - margin.top - margin.bottom
  const g = graph.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  function addDivisionLine(xPos: number, name: string) {
    g.append('line')
    .attr('class', 'division ' + name)
    .attr('x1', xPos)
    .attr('x2', xPos)
    .attr('y1', y(-1))
    .attr('y2', y(1))

    g.append('text')
    .attr('class', 'chart-legend')
    .attr('transform', 'rotate(90)')
    .attr('y', -xPos)
    .attr('dy', '-0.4em')
    .text(name)
  }

  const x = scaleLinear()
  .domain([0, graphData.length])
  .rangeRound([0, width])

  const y = scaleLinear()
  .domain([-1, 1])
  .rangeRound([height, 0])

  const line = d3Area<Point>()
  .x((_, i) => x(i))
  .y(d => y(d.acpl))

  const area = d3Area<Point>()
  .x((_, i) => x(i))
  .y1(d => d.acpl >= 0 ? y(d.acpl) : y(0))

  g.datum(graphData)

  g.append('line')
  .attr('class', 'zeroline')
  .attr('x1', 0)
  .attr('x2', width)
  .attr('y1', y(0))
  .attr('y2', y(0))

  g.append('clipPath')
  .attr('id', 'clip-below')
  .append('path')
  .attr('d', area.y0(d => y(d.acpl)))

  g.append('clipPath')
  .attr('id', 'clip-above')
  .append('path')
  .attr('d', area.y0(y(0)))

  g.append('path')
  .attr('class', 'area above')
  .attr('clip-path', 'url(#clip-above)')
  .attr('d', area)

  g.append('path')
  .attr('class', 'area below')
  .attr('clip-path', 'url(#clip-below)')
  .attr('d', area.y0(d => d.acpl <= 0 ? y(d.acpl) : y(0)))

  g.append('path')
  .attr('class', 'line')
  .attr('d', line)

  if (division) {
    if (opening && opening.ply) {
      addDivisionLine(x(opening.ply), 'Opening')
    }
    if (division.middle) {
      addDivisionLine(x(division.middle), 'Middlegame')
    }
    if (division.end) {
      addDivisionLine(x(division.end), 'Endgame')
    }
  }

}

function makeSerieData(d: AnalyseData): Point[] {
  return d.treeParts.slice(1).map((node) => {
    const ply = node.ply!
    const color = ply & 1

    let cp: number

    if (node.eval && node.eval.mate) {
      cp = node.eval.mate > 0 ? Infinity : -Infinity
    } else if (node.san && node.san.indexOf('#') > 0) {
      cp = color === 1 ? Infinity : -Infinity
      if (d.game.variant.key === 'antichess') cp = -cp
    } else if (node.eval && node.eval.cp !== undefined) {
      cp = node.eval.cp
    } else return {
      acpl: 0
    }

    const turn = Math.floor((ply - 1) / 2) + 1
    const dots = color === 1 ? '.' : '...'
    const point = {
      name: turn + dots + ' ' + node.san,
      acpl: 2 / (1 + Math.exp(-0.004 * cp)) - 1
    }
    return point
  })
}
