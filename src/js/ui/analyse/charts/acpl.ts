import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import { area } from 'd3-shape'

import { AnalyseData } from '../../../lichess/interfaces/analyse'

interface Point {
  name?: string
  acpl: number
}

export default function AcplChart(element: SVGElement, aData: AnalyseData) {
  const graph = select(element)
  const graphData = makeSerieData(aData)
  const data = graphData.map((p, i) => [i + 1, p.acpl] as [number, number])
  const margin = {top: 10, right: 20, bottom: 10, left: 20}
  const width = +graph.attr('width') - margin.left - margin.right
  const height = +graph.attr('height') - margin.top - margin.bottom
  const g = graph.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  const xvalues = data.map(d => d[0])
  const scaleX = scaleLinear()
  .domain([Math.min.apply(null, xvalues), Math.max.apply(null, xvalues)])
  .rangeRound([0, width])

  const scaleY = scaleLinear()
  .domain([-1.1, 1.1])
  .rangeRound([height, 0])

  const l = area()
  .x(d => scaleX(d[0]))
  .y0(height)
  .y1(d => scaleY(d[1]))

  g.append('path')
  .attr('class', 'path')
  .attr('fill', 'steelblue')
  .attr('stroke', 'steelblue')
  .attr('stroke-linejoin', 'round')
  .attr('stroke-linecap', 'round')
  .attr('stroke-width', 0)
  .attr('d', l(data) as string)
}



export function makeSerieData(d: AnalyseData): Point[] {
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
